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
            'get': {controller: 'count.getCount'},
            'post': [
                {controller: 'count.incrementCount'}
            ]
        },

        '^\/api\/greet\/aloha\/(a-zA-Z)+': {
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

        '2.0.0': {
            '/api/greet/hello/:name': {
                middleware: [
                    'authenticated',
                    microservice.policies['blacklist']('mark')
                ],
                'get': 'greet.hello'
            }
        }
    };
};
