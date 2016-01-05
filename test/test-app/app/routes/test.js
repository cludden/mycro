'use strict';

module.exports = function() {
    return {
        policies: [],
        '/all': {
            post: 'test.allParams'
        },
        '/body': {
            post: 'test.bodyParser'
        },
        '/options': {
            options: {
                desc: '/api/test/options'
            },
            get: function(req, res) {
                res.json(200, {options: req.options});
            },
            '/l1': {
                options: {
                    depth1: 'a'
                },
                get: function(req, res) {
                    res.json(200, {options: req.options});
                },
                '/l2': {
                    options: {
                        depth2: 'b'
                    },
                    get: function(req, res) {
                        res.json(200, {options: req.options});
                    }
                }
            }
        },
        '/query': {
            get: 'test.queryParser'
        }
    };
};
