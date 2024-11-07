import http from 'k6/http';
import { sleep } from 'k6';

/*
iterations 가 없으므로 duration 동안 계속 실행됨
 */
export const options = {
    discardResponseBodies: true,
    scenarios: {
        contacts: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
        },
    },
};

export default function () {
    http.get('https://test.k6.io/contacts.php');
    // Injecting sleep
    // Total iteration time is sleep + time to finish request.
    sleep(0.5);
}