import http from 'k6/http';

export const options = {
    discardResponseBodies: true,

    scenarios: {
        contacts: {
            executor: 'ramping-arrival-rate',

            // Start iterations per `timeUnit`
            startRate: 100,

            // Start `startRate` iterations per minute
            timeUnit: '1s',

            // Pre-allocate necessary VUs.
            preAllocatedVUs: 500,

            stages: [
                // Start 300 iterations per `timeUnit` for the first minute.
                { target: 3000, duration: '10s' },

                // Linearly ramp-up to starting 600 iterations per `timeUnit` over the following two minutes.
                { target: 6000, duration: '20s' },

                // Continue starting 600 iterations per `timeUnit` for the following four minutes.
                { target: 600, duration: '20s' },

                // Linearly ramp-down to starting 60 iterations per `timeUnit` over the last two minutes.
                { target: 60, duration: '10s' },
            ],
        },
    },
};

export default function () {
    http.get('https://command-center-server.dev.insight.lunit.io/health');
}