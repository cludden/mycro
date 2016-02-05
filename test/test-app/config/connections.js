'use strict';

var adapterOne = require('../../test-adapters/one'),
    adapterTwo = require('../../test-adapters/two');

module.exports = {
    one: {
        adapter: adapterOne,
        config: {
            host: 'localhost',
            port: 1,
            username: 'user',
            password: 'password',
            database: 'test'
        },
        default: true
    },

    two: {
        adapter: adapterTwo,
        config: function(mycro) {
            return {
                url: 'https://localhost:2;localhost:3;localhost:4',
                user: 'user',
                password: 'password',
                database: 'test'
            };
        },
        models: [
            'users',
            'groups'
        ]
    }
};
