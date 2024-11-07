/*
$ k6 run -e BASE_URL="https://test-api.k6.io" env-var.js
 */

import http from 'k6/http';

export default function () {

    http.get(`${__ENV.BASE_URL}/public/crocodiles/`);
}