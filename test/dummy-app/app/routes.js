'use strict';

module.exports = function(microservice) {
    return {
        middleware: [
            'default',
            function(req, res, next) {
                req.microservice.log('trace', 'inline default middleware');
                next();
            }
        ],

        '/api/greet/hello/:name': {
            'get': 'greet.hello'
        },

        '^\/api\/greet\/aloha\/(a-zA-Z)+': {
            regex: true,
            middleware: [
                'authenticated'
            ],
            'get': 'greet.aloha',
            'post': 'greet.aloha'
        },

        'v2.0.0': {
            '/api/greet/hello/:name': {
                middleware: [
                    'authenticated',
                    'blacklist'
                ],
                'get': 'greet.aloha'
            }
        }
    };
};
