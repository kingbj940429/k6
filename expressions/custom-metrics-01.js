import http from 'k6/http';
import {sleep} from 'k6';
import {Counter} from 'k6/metrics';

export const options = {
    vus: 5,
    duration: '5s',
    thresholds: {
        http_req_duration: ['p(95)<25'],
        my_counter: ['count>10']
    }
}

let myCounter = new Counter('my_counter');

export default function () {
    const res = http.get('https://command-center-server.dev.insight.lunit.io/health');
    myCounter.add(1);
    sleep(1);
}