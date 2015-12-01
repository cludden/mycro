'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function(cb) {
    var self = this;

    var policies = include({
        dirname     :  process.cwd() + '/api/policies',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    _.extend(self.policies, policies);
    cb();
};
