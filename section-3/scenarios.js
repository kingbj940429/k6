import http from 'k6/http';

export default function () {
    const res = http.get('https://test.k6.io/');
    const res2 = http.get('https://test.k6.io/foo.html');

    console.log(res);

    console.log(res.status);
    console.log(res.status2);

    console.log(res.body);
}