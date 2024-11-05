import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    stages: [
        {
            duration: '1m',
            target: 100,
        },
        {
            duration: '10m',
            target: 100,
        },
        {
            duration: '1m',
            target: 0,
        }
    ]
}

export default function () {
    http.get('https://command-center-server.dev.insight.lunit.io/health');
    sleep(1);
}