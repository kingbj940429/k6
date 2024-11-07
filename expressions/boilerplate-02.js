
import http from 'k6/http';
import {sleep, check, group} from 'k6';
import {Counter} from 'k6/metrics';

const httpErrors = new Counter('http_errors');
const requestCounter = new Counter('request_counter');
const baseUrl = "";

export const options = {
    vus: 3,
    duration: '3s',
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
    }
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

        requestCounter.add(1);
    });

    group('Status 201', function(){
        let res = http.get('https://run.mocky.io/v3/eaf490cf-ca24-4a34-be67-b43bc4c98321', {my_tag: "status_201"});
        if (res.error) {
            httpErrors.add(1, {my_tag: "status_201"});
        }

        check(res, {
            'status is 201': (r) => r.status === 201,
        }, {my_tag: "status_201"});
    });

    sleep(1);
}