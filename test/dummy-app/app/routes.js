'use strict';

module.exports = function(microservice) {
    return {
        middleware: [
            'default',
            function(req, res, next) {
                req.microservice.log('silly', 'inline default middleware');
                next();
            }
        ],

        '/api/count': {
            'del': 'count.resetCount',
            'get': {controller: 'count.getCount'},
            'post': [
                {controller: 'count.incrementCount'}
            ],
            'put': [
                {policy: 'authenticated'},
                {controller: 'count.incrementCount'}
            ]
        },

        '\/api\/greet\/aloha\/([A-Za-z]+)': {
            regex: true,
            middleware: [
                'authenticated'
            ],
            'get': 'greet.aloha',
            'post': 'greet.aloha'
        },

        '/api/greet/hello/:name': {
            'get': 'greet.hello'
        },

        '/api/test/all': {
            'post': 'test/test.requestAll'
        },

        '/api/test/body': {
            'post': 'test/test.bodyParams'
        },

        '/api/test/query': {
            'get': 'test/test.queryParams'
        },

        '1.1.0': {
            '/api/count': {
                'get': 'count.getCount'
            }
        },

        '2.0.0': {
            middleware: [
                'v2/default'
            ],

            '/api/count': {
                'get': 'count.getCount',
                'post': 'count.incrementCount',
                'del': [
                    function(req, res, next) {
                        res.set('x-test-header', 'true');
                        next();
                    },
                    function(req, res) {
                        res.json(200, {message: 'boo'});
                    }
                ]
            },

            '/api/greet/hello/:name': {
                middleware: [
                    'v2/default',
                    'authenticated',
                    microservice.policies['blacklist']('mark')
                ],
                'get': 'greet.hello'
            }
        }
    };
};
