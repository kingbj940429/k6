/*
- 보면 http.get 하는 것이 2개가 있는데, 만약 태그를 사용하지 않는다면 모든 값이 합쳐져서 나올 것이다. 그럼 구분이 안될텐데, 이때 태그를 통해 구분할 수 있음
- tags 사용하려면 threshold 에 값을 지정해야함 → 안하면 결과 메트릭에 출력안됨
 */

import http from 'k6/http';
import {Counter} from 'k6/metrics';
import {check, sleep} from 'k6';

export const options = {
    vus: 5,
    duration: '3s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        'http_req_duration{page:order}': ['p(95)<250'],
        http_errors: ['count==0'],
        'http_errors{page:order}': ['count==0'],
        checks: ['rate>=0.99'], //200, 201 를 포함해서 99% 이상 통과
        'checks{page:order}': ['rate>=0.99'], // 201 만 99% 이상 통과
    }
}

const httpErrors = new Counter('http_errors');

export default function () {
    // 글로벌 Res
    let res = http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467'); // status 200

    if (res.error) {
        httpErrors.add(1);
    }

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    // 글로벌 Res 에 포함 + tags 로 따로 필터링
    http.get('https://run.mocky.io/v3/eaf490cf-ca24-4a34-be67-b43bc4c98321',
        {
            tags: {
                page: 'order',
            }
        }
    ); // status 201

    if(res.error) {
        httpErrors.add(1, {page: 'order'}); // 글로벌한 error 에 포함 + page 로 따로 필터링
    }

    check(res, {
       'status is 201': (r) => r.status === 201,
    }, {page: 'order'});

    sleep(1);
}

/*

 */