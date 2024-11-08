import http from 'k6/http';
import {sleep, check, group} from 'k6';
import {Counter} from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import exec from 'k6/execution';

const httpErrors = new Counter('http_errors');
const requestCounter = new Counter('request_counter');
const baseUrl = "https://command-center-server.dev.insight.lunit.io";

export const options = {
    discardResponseBodies: false,
    thresholds: {
        http_req_duration: ['p(95)<500'],
        'http_req_duration{status:200}': ['p(95)>5'],
        'http_req_duration{status:400}': ['p(95)<5'],

        http_errors: ['count==0'],
        'http_errors{my_tag: status_200}': ['count==0'],
        'http_errors{my_tag: status_201}': ['count==0'],

        request_counter: ['count>5'],

        checks: ['rate>=0.99'],
        'checks{my_tag: status_200}': ['rate>=0.99'], //tags 사용하려면 threshold 에 값을 지정해야함 → 안하면 결과 메트릭에 출력안됨
        'checks{my_tag: status_201}': ['rate>=0.99'],

        'group_duration{group:::Status 200}': ['p(95)<200'],
        'group_duration{group:::Status 201}': ['p(95)<200'],
        //'group_duration{group:::Main page::Assets}': ['p(95)<200'],
    },
    scenarios: {
        smoke_test: {
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '30s',
        },
        load_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                {duration: '10s', target: 100},
                {duration: '1m', target: 100},
                {duration: '10s', target: 0},
            ],
        },
    },
    tags: {
        testid: 'boilerplate-complete-02'
    }
}

export function setup() {
    const res = http.get(`${baseUrl}/health`);
    if (res.error) {
        exec.test.abort('Aborting test. Application is DOWN');
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
        exec.test.abort('Aborting test. Unable to get access token');
    }

    return accessToken
}

export function teardown(accessToken) {
    console.log(`Tearing down... ${accessToken}`);
}

export default function (accessToken) {
    group('Health Check', function () {
        let res = http.get(`${baseUrl}/health`, {
            headers: {'Authorization': `Bearer ${accessToken}`},
        }, {my_tag: "health_check"}); // status 200
        if (res.error) {
            httpErrors.add(1, {my_tag: "health_check"});
        }

        check(res, {
            'status is 200': (r) => r.status === 200,
            'status is not 400': (r) => r.status !== 400,
        }, {my_tag: "health_check"});

        requestCounter.add(1);
    });

    group('List Apps', function () {
        let res = http.get(`${baseUrl}/api/v1/apps`, {
            headers: {'Authorization': `Bearer ${accessToken}`},
        }, {my_tag: "list_apps"});

        check(res, {
            'status is 200': (r) => r.status === 200,
        }, {my_tag: "list_apps"});
    });

    sleep(randomIntBetween(1, 5)); // sleep between 1 and 5 seconds.
}

function getAccessToken() {
    const data = {
        client_id: 'command-center',
        grant_type: 'password',
        scope: 'email openid profile roles',
        username: __ENV.TESTER_USERNAME || 'k6-tester@lunit.io',
        password: __ENV.PASSWORD,
    };
    const res = http.post('https://keycloak.lunit.in/realms/lunit/protocol/openid-connect/token', data)

    return res.json()['access_token'];
}