/*
애플리케이션 자체와 통신이 안되는데 굳이 테스트할 필요는 없음!

그래서 setup() 함수를 통해 우선 통신이 되는지 확인하고 그 이후에 default 함수를 사용함!

만약 통신이 안된다면 abort 를 이용해서 중단시킴
 */

import http from 'k6/http';
import {sleep} from 'k6';
import exec from 'k6/execution';

export const options = {
    vus: 5,
    duration: '3s',
}

export function setup() {
    let res = http.get('https://test.k6.local/status');
    if (res.error) {
        exec.test.abort('Aborting test. Application is DOWN');
    }
}

export default function () {
    http.get('https://test.k6.local/some-page');

    sleep(1);
}
