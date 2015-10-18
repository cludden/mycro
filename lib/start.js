'use strict';

var async = require('async');

module.exports = function(callback) {
    var self = this;
    async.series([
        self.getConfig.bind(self),
        self.registerConnections.bind(self),
        self.registerModels.bind(self)
    ], function(err) {
        if (err) return callback(err);
        callback();
    });
};