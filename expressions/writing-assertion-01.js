import http from 'k6/http';
import { check } from 'k6';

export default function () {
    const res = http.get('https://test.k6.io/');

    check(true, {
        'true is true': (value) => value === true
    })

    check(false, {
        'true is true': (value) => value === true
    })
}