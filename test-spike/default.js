import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    stages: [
        {
            duration: '1m', // 갑작스럽게 증가하다가
            target: 10000
        },
        {
            duration: '1m', // 갑작스럽게 감소
            target: 0
        }
    ]
}

export default function () {
    http.get('https://command-center-server.dev.insight.lunit.io/health');
    sleep(1);
}