import http from 'k6/http';
import { sleep } from 'k6';

/*
maxDuration 동안 실행되지만 각 vu 가 할당된 20번의 반복을 전부 끝내면
maxDuration 랑 상관없이 테스트는 끝남
 */
export const options = {
    discardResponseBodies: true,
    scenarios: {
        contacts: {
            executor: 'per-vu-iterations',
            vus: 10,
            iterations: 20,
            maxDuration: '30s',
        },
    },
};

export default function () {
    http.get('https://test.k6.io/contacts.php');
    // Injecting sleep
    // Sleep time is 500ms. Total iteration time is sleep + time to finish request.
    sleep(0.5);
}