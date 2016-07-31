'use strict';

const async = require('async');

module.exports = function bootstrap(done) {
    const mycro = this;
    mycro.bar = 'baz';
    async.setImmediate(done);
};
