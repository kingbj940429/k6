import http from 'k6/http';
import { check } from 'k6';
import { sleep } from 'k6';
import exec from 'k6/execution';

export const options = {
    vus: 10,
    duration: '10s',
    thresholds: {
        //http_req_duration: ['p(95)<100'],
        http_req_duration: ['max<2000'],
        http_req_failed: ['rate<0.1'],
        //http_reqs: ['count>20'],
        http_reqs: ['rate>4'],
        vus: ['value>9'],
        checks: ['rate>=0.99']
    }
}

export default function () {
    // 첫 번째 반복에서만 오류를 유발할 주소로 요청을 보내고 싶습니다.
    // exec.scenario.iterationInTest : 테스트 때마다 숫자가 하나씩 증가함
    const res = http.get('https://test.k6.io/' + (exec.scenario.iterationInTest === 1 ? 'foo' : ''));

    check(res, {
        'status is 200': (r) => r.status === 200,
        'page is startpage': (r) => r.body.includes('Collection of simple web-pages')
    });
    sleep(2);
}