import http from 'k6/http';
import {sleep, check, group} from 'k6';
import {Counter} from 'k6/metrics';
import {randomIntBetween} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import exec from 'k6/execution';

const httpErrors = new Counter('http_errors');
const requestCounter = new Counter('request_counter');
const baseUrl = "https://command-center-server.blue.lunit.in";
const endpoints = {
    health: `${baseUrl}/health`,
    apps: {
        list: `${baseUrl}/api/v1/apps`,
    }
}

const groups = {
    health_check: 'health_check',
    apps: {
        name: 'apps',
        list: 'list_apps',
    }
};

export const options = {
    discardResponseBodies: false,
    tags: {
        testid: 'command-center-prod-blue-short-load'
    },
    thresholds: (() => {
        const thresholds = {};

        thresholds[`http_req_duration`] = ['p(95)<250'];
        thresholds[`http_req_duration{status:200}`] = ['p(95)>5'];
        thresholds[`http_req_duration{status:400}`] = ['p(95)<5'];

        thresholds[`http_errors`] = ['count==0'];
        thresholds[`http_errors{group_tag: ${groups.health_check}}`] = ['count==0'];
        thresholds[`http_errors{group_tag: ${groups.apps.list}}`] = ['count==0'];

        thresholds[`checks`] = ['rate>=0.99'];
        thresholds[`checks{group_tag: ${groups.health_check}}`] = ['rate>=0.99'];
        thresholds[`checks{group_tag: ${groups.apps.list}}`] = ['rate>=0.99'];

        thresholds[`group_duration{group:::${groups.health_check}}`] = ['p(95)<250'];
        thresholds[`group_duration{group:::${groups.apps.name}}`] = ['p(95)<250'];
        thresholds[`group_duration{group:::${groups.apps.name}::${groups.apps.list}}`] = ['p(95)<250'];

        thresholds[`request_counter`] = ['count>50'];

        return thresholds;
    })(),
    scenarios: {
        smoke_test: {
            executor: 'per-vu-iterations',
            exec: 'smokeTest',
            vus: 1,
            iterations: 1,
            maxDuration: '3s',
            tags: {type: 'smoke'}
        },
        load_test: {
            executor: 'ramping-vus',
            exec: 'loadTest',
            startVUs: 0,
            startTime: '3s',
            stages: [
                {duration: '2s', target: 30},
                {duration: '10s', target: 30},
                {duration: '2s', target: 0},
            ],
            tags: {type: 'load'}
        },
    },
}

export function setup() {
    const res = http.get(endpoints.health);
    if (res.error) {
        exec.test.abort('Aborting test. Application is DOWN');
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
        exec.test.abort('Aborting test. Unable to get access token');
    }

    return accessToken;
}

export function teardown() {
    console.log('Tearing down...');
}

export function smokeTest(accessToken) {
    group(groups.health_check, function () {
        let res = http.get(endpoints.health, {
            headers: {'Authorization': `Bearer ${accessToken}`},
        }, {group_tag: groups.health_check}); // status 200
        if (res.error) {
            httpErrors.add(1, {group_tag: groups.health_check});
        }

        check(res, {
            'status is 200': (r) => r.status === 200,
            'status is not 400': (r) => r.status !== 400,
        }, {group_tag: groups.health_check});

        requestCounter.add(1);
    });

    sleep(randomIntBetween(1, 5));
}

export function loadTest(accessToken) {
    group(groups.apps.name, function () {
        group(groups.apps.list, function () {
            let res = http.get(endpoints.apps.list, {
                headers: {'Authorization': `Bearer ${accessToken}`},
            }, {group_tag: groups.apps.list});
            if (res.error) {
                httpErrors.add(1, {group_tag: groups.apps.list});
            }

            check(res, {
                'status is 200': (r) => r.status === 200,
            }, {group_tag: groups.apps.list});

            requestCounter.add(1);
        });
    });

    sleep(randomIntBetween(1, 5));
}

function getAccessToken() {
    const data = {
        client_id: __ENV.CLIENT_ID || 'command-center',
        grant_type: 'password',
        scope: 'email openid profile roles',
        username: __ENV.TESTER_USERNAME || 'k6-tester@lunit.io',
        password: __ENV.TESTER_PASSWORD,
    };
    const res = http.post('https://keycloak.lunit.in/realms/lunit/protocol/openid-connect/token', data)

    return res.json()['access_token'];
}