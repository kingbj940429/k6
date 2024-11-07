import http from 'k6/http';
import {sleep} from 'k6';

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<500'],
        'http_req_duration{testid: test}': ['p(95)<500'],
    },
    stages: [
        {
            duration: '10s',
            target: 100,
        },
        {
            duration: '30s',
            target: 100,
        },
        {
            duration: '10s',
            target: 0,
        }
    ],
    tags: {
        testid: 'test-load'
    }
}

export default function () {
    http.get('https://command-center-server.dev.insight.lunit.io/health', {tags: {test: 'test-load'}});
    sleep(1);
}