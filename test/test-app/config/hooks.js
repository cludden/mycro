'use strict';

module.exports = [
    'connections',
    'models',
    'server',
    'services',
    'policies',
    'controllers',
    'routes',
    function test_function_hook(cb) {
        var mycro = this;
        mycro.log('silly', 'controllers:', mycro.controllers.length);
        cb();
    }
];
