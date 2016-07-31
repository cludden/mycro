'use strict';

module.exports = function(mycro) {
    return {
        fn() {
            return mycro.config.test.foo;
        }
    };
};
