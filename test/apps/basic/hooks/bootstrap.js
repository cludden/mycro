'use strict';

module.exports = function bootstrap(done) {
    const mycro = this;
    mycro.bar = 'baz';
    process.nextTick(done);
};
