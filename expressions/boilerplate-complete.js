import http from 'k6/http';
import {sleep, check, group} from 'k6';
import {Counter} from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import exec from 'k6/execution';

const httpErrors = new Counter('http_errors');
const requestCounter = new Counter('request_counter');
const baseUrl = "";

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
                {duration: '20s', target: 10},
                {duration: '10s', target: 0},
            ],
        },
    },
    tags: {
        testid: 'boilerplate-03'
    }
}

export function setup() {
    const res = http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467');
    if (res.error) {
        exec.test.abort('Aborting test. Application is DOWN');
    }

    console.log(res.body);

    return res.status
}

export function teardown(status) {
    console.log(`Tearing down... ${status}`);
}

export default function () {
    group('Status 200', function () {
        let res = http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467', {my_tag: "status_200"}); // status 200
        if (res.error) {
            httpErrors.add(1, {my_tag: "status_200"});
        }

        check(res, {
            'status is 200': (r) => r.status === 200,
            'status is not 400': (r) => r.status !== 400,
        }, {my_tag: "status_200"});

        group('Has body', function () {
            let res = http.get("https://run.mocky.io/v3/64f3ba8a-7700-4b38-b19a-ae8df8bea0a5", {my_tag: "has_body"});

            check(res, {
                'has body': (r) => r.body.length > 0
            }, {my_tag: "has_body"})
        });

        requestCounter.add(1);
    });

    group('Status 201', function () {
        let res = http.get('https://run.mocky.io/v3/eaf490cf-ca24-4a34-be67-b43bc4c98321', {my_tag: "status_201"});
        if (res.error) {
            httpErrors.add(1, {my_tag: "status_201"});
        }

        check(res, {
            'status is 201': (r) => r.status === 201,
        }, {my_tag: "status_201"});
    });

    sleep(randomIntBetween(1, 5)); // sleep between 1 and 5 seconds.
}