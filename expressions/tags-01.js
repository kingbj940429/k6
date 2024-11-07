import http from 'k6/http';

export const options = {
    vus: 5,
    duration: '5s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        'http_req_duration{status:200}': ['p(95)<500'],  // {status:200} 만 계산된 메트릭 산출 가능
        'http_req_duration{status:201}': ['p(95)<500'],
    }
}

export default function () {
    http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467'); // status 200
    //http.get('https://run.mocky.io/v3/48aa964b-c2db-4c26-9d4e-32c375645467?mocky-delay=2000ms'); // status 200

    http.get('https://run.mocky.io/v3/907f1158-0ac8-4eda-89c4-4191c6629ae7'); // status 201
}

/*
     data_received..................: 19 kB  3.1 kB/s
     data_sent......................: 4.7 kB 761 B/s
     http_req_blocked...............: avg=213.02ms min=2µs      med=7.5µs max=1.02s    p(90)=1.01s    p(95)=1.01s
     http_req_connecting............: avg=6.98ms   min=0s       med=0s    max=43.31ms  p(90)=30.92ms  p(95)=36.58ms
   ✗ http_req_duration..............: avg=1.3s     min=251.31ms med=1.32s max=2.45s    p(90)=2.31s    p(95)=2.45s
       { expected_response:true }...: avg=1.3s     min=251.31ms med=1.32s max=2.45s    p(90)=2.31s    p(95)=2.45s
     ✗ { status:200 }...............: avg=1.3s     min=251.31ms med=1.32s max=2.45s    p(90)=2.31s    p(95)=2.45s
     ✓ { status:201 }...............: avg=0s       min=0s       med=0s    max=0s       p(90)=0s       p(95)=0s
     http_req_failed................: 0.00%  0 out of 20
     http_req_receiving.............: avg=265.65µs min=14µs     med=73µs  max=3.89ms   p(90)=139.2µs  p(95)=337.39µs
     http_req_sending...............: avg=18.85µs  min=4µs      med=17µs  max=50µs     p(90)=28µs     p(95)=29.09µs
     http_req_tls_handshaking.......: avg=205.54ms min=0s       med=0s    max=999.51ms p(90)=975.61ms p(95)=989.26ms
     http_req_waiting...............: avg=1.3s     min=251.17ms med=1.32s max=2.45s    p(90)=2.31s    p(95)=2.45s
     http_reqs......................: 20     3.237353/s
     iteration_duration.............: avg=3.04s    min=2.51s    med=3.01s max=3.61s    p(90)=3.6s     p(95)=3.6s
     iterations.....................: 10     1.618676/s
     vus............................: 5      min=5       max=5
     vus_max........................: 5      min=5       max=5

 */