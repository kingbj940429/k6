import http from 'k6/http';
import {sleep} from 'k6';

export const options = {
    stages: [
        {
            duration: '10s',
            target: 1000,
        },
        {
            duration: '10s',
            target: 100,
        },
        {
            duration: '10s',
            target: 0,
        },
    ]
}

export default function () {
    http.get('https://command-center-server.dev.insight.lunit.io/health');
    sleep(1);
}