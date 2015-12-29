'use strict';

module.exports = [
    'server',
    'services',
    'policies',
    'controllers',
    'routes',
    function test_function_hook(cb) {
        var microservice = this;
        microservice.log('silly', 'controllers:', microservice.controllers.length);
        cb();
    }
];
