'use strict';

var include = require('include-all'),
    _ = require('lodash');

module.exports = function Policies(cb) {
    var self = this;
    if (!_.isObject(self.policies)) {
        self.policies = {};
    }

    var policies = include({
        dirname:  process.cwd() + '/app/policies',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    _.extend(self.policies, policies);
    cb();
};
