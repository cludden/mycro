'use strict';

var async = require('async');

module.exports = function(callback) {
    var self = this;
    async.series([
        self.connections.bind(self),
        self.models.bind(self)
    ], function(err) {
        if (err) return callback(err);
        callback();
    });
};
