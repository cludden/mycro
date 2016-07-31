'use strict';

const async = require('async');

module.exports = [
    function(done) {
        async.setImmediate(function() {
            done(new Error('something went wrong'));
        });
    }
];
