'use strict';

module.exports = function mycroTestHook(done) {
    const mycro = this;
    mycro.foo = 'bar';
    process.nextTick(done);
};
