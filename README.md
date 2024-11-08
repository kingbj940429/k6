# k6

## Write Remote
```shell
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
K6_PROMETHEUS_RW_TREND_STATS=p(95),p(90),min,max \
k6 run -o experimental-prometheus-rw -e TESTER_PASSWORKD="aaa" boilerplate-lab-01.js
```