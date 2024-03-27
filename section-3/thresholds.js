import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '10s',
    thresholds: {
        http_req_duration: ['p(95)<100'], // Trend: p(95) 가 100ms 이하여야 통과 
        http_req_failed: ['rate<0.01'], // Rate: fail 확률이 1% 미만이여야함
        http_reqs: ['count>100'], // Counter: https_reqs = 100 로만 표현되서 rate, p(95) 같은 것이 없는데 이런 거 이렇게 쓰면됨
        http_reqs: ['rate>1'], // Rate: https_reqs 보면 13 숫자 옆에 흐리게 0.7/s 가 있는데 이게 rate 임
        vus: ['value>9'] // Gauge: Gauge Type 은 value 로 사용
    }
}

export default function () {
    const res = http.get('https://test.k6.io/');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'page is startpage': (r) => r.body.includes('Collection of simple web-pages')
    });
    sleep(2);
}