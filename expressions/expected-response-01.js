/*
expected_response: true 는 200에서 399 사이만 계산됨
 */

import http from 'k6/http';
import {sleep, group, check} from 'k6';

export const options = {
    vus: 5,
    duration: '3s',
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        'http_req_duration{expected_response:true}': ['p(95)<1000'],
        'group_duration{group:::Main page}': ['p(95)<3000'],
        'group_duration{group:::Main page::Assets}': ['p(95)<1000'],
        'group_duration{group:::News page}': ['p(95)<1000'],
    },
}

export default function () {

    group('Main page', function () {
        let res = http.get('https://run.mocky.io/v3/6aeafac2-c86c-4a2d-bc57-f3b6ec60c8ee?mocky-delay=900ms'); //status 503
        check(res, { 'status is 200': (r) => r.status === 200 });

        group('Assets', function () {
            http.get('https://run.mocky.io/v3/6aeafac2-c86c-4a2d-bc57-f3b6ec60c8ee?mocky-delay=900ms');
            http.get('https://run.mocky.io/v3/6aeafac2-c86c-4a2d-bc57-f3b6ec60c8ee?mocky-delay=900ms');
        });
    });


    group('News page', function () {
        http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467'); //status 200
    });

    sleep(1);
}
