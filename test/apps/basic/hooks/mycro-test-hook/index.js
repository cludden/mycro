'use strict';

const async = require('async');

module.exports = function mycroTestHook(done) {
    const mycro = this;
    mycro.foo = 'bar';
    async.setImmediate(done);
};
