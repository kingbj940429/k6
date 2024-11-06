import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '10s',
    thresholds : {
        http_req_duration: ['p(95)<100'], // p(95) 가 100ms 미안여야 통과
        http_req_failed: ['rate<0.01'], // fail 율이 1% 미만여야 통과
    }
}

export default function () {
    const res = http.get('https://command-center-server.dev.insight.lunit.io/health');

    console.log(res.status);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'page is startpage': (r) => r.body.includes('Collection of simple web-pages')
    })
    sleep(2);
}