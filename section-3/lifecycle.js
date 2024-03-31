import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 2,
    duration: '5s'
}

console.log(' -- init stage --');

export default function (data) {
    console.log('-- VU stage --');
    // console.log(data);
    sleep(1);
}

export function setup() {
    console.log('-- setup stage --');
    sleep(3);
    const data = { foo: 'bar' };
    return data;
}



export function teardown(data) {
    sleep(3);
    console.log('-- Teardown stage --');
}