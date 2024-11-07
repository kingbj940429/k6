import http from 'k6/http';
import {sleep} from 'k6';

export const options = {
    vus: 5,
    duration: '3s',
}

// k6/http 와 같은 모듈을 import 하는 영역
// options 을 정의하는 영역
// default, setup, teardown 과 같은 정의된 함수 외에는 어떤 함수도 사용가능
console.log('-- init stage --');

// 무조건 있어야 하는 함수 → 없으면 에러남
// VU Stage 라고 불리는 이유는 VU 마다 실행되기 때문
export default function (data) {
    console.log('-- VU stage --');
    console.log(data); // setup() 에서 return 해주면 알아서 default 함수에서 사용함
    sleep(1);
}

// 오직 한번만 실행됨
// default function 에 필요한 값을 넘겨줄 때 유용하게 사용할 수 있음
// ardown 함수에도 넘겨줄 수 있음
// setup() 에서 return 해주면 알아서 default 함수에서 사용함
export function setup() {
    console.log('-- setup stage --');
    sleep(5);
    const data = {foo: 'bar'};
    return data;
}

// 모든 테스트가 끝나고 스크립트를 종료하기 직전 오직 한번만 실행됨
export function teardown(data) {
    console.log('-- teardown stage --');
}