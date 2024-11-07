/*
Main Page 에서 5000ms , Assets 에서 2000ms (1000ms + 1000ms) 해서 최소 7000ms 이상 걸리고, {group:::Main page}} 를 보면 다시 7초 이상인걸 확인할 수 있음 .

7.63s 은 아마 저 서버까지 총 왔다갔다 하는데 630ms 가 추가되서 그런거임
 */

import http from 'k6/http';
import {sleep, group, check} from 'k6';

export const options = {
    vus: 5,
    duration: '10s',
    thresholds: {
        http_req_duration: ['p(95)<250'],
        'group_duration{group:::Main page}': ['p(95)<8000'],
        'group_duration{group:::News page}': ['p(95)<6000'],
        'group_duration{group:::Main page::Assets}': ['p(95)<3000'],
    },
}

export default function () {
    group('Main page', function () {
        let res = http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467?mocky-delay=5000ms');
        check(res, {'status is 200': (r) => r.status === 200});

        group('Assets', function () {
            http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467?mocky-delay=1000ms');
            http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467?mocky-delay=1000ms');
        });
    });

    group('News page', function () {
        http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467?mocky-delay=5000ms');
    });

    sleep(1);
}