'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function Services(cb) {
    var self = this;
    self.services = {};

    var services = include({
        dirname     :  process.cwd() + '/app/services',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    services = _.mapValues(services, function(constructor) {
        if (typeof constructor === 'function') {
            if (constructor.length === 1) return constructor(self);
            return constructor();
        }
        return constructor;
    });

    _.extend(self.services, services);
    cb();
};
