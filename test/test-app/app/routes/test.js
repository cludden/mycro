'use strict';

module.exports = function(microservice) {
    return {
        policies: [],
        '/all': {
            post: 'test.allParams'
        },
        '/body': {
            post: 'test.bodyParser'
        },
        '/query': {
            get: 'test.queryParser'
        }
    };
};
