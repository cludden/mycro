'use strict';

module.exports = {
    add: function(a, b, cb) {
        cb(null, a + b);
    },

    subtract: function(a, b, cb) {
        cb(null, a - b);
    }
};
