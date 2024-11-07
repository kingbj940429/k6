import http from 'k6/http';
import {sleep, group, check} from 'k6';

export const options = {
    vus: 5,
    duration: '3s',
    thresholds: {
        http_req_duration: ['p(95)<250'],
        'http_req_duration{asset:css}': ['p(95)<250'],
        'http_req_duration{asset:js}': ['p(95)<250'],
    },
}

export default function () {
    group('Main page', function () {
        let res = http.get('https://test.k6.io');
        check(res, {'status is 200': (r) => r.status === 200});

        group('Assets', function () {
            http.get('https://test.k6.io/static/css/site.css', {tags: {asset: 'css'}});
            http.get('https://test.k6.io/static/js/prisms.js', {tags: {asset: 'js'}});
        });
    });

    group('News page', function () {
        http.get('https://test.k6.io/news.php');
    });

    sleep(1);
}