'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function(cb) {
    var self = this;
    self.log('silly', '[policies] hook starting');

    var policies = include({
        dirname     :  process.cwd() + '/app/policies',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    _.extend(self.policies, policies);
    self.log('info', '[policies] hook complete');
    cb();
};
