import http from 'k6/http';
import { check } from 'k6';

export default function () {
    const res = http.get('https://command-center-server.dev.insight.lunit.io/health');

    console.log(res.status);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'page is startpage': (r) => r.body.includes('Collection of simple web-pages')
    })
}