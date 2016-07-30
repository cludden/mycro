'use strict';

const async = require('async');
const include = require('include-all');
const _ = require('lodash');

module.exports = function policies(done) {
    const mycro = this;

    if (!_.isObject(mycro.policies)) {
        mycro.policies = {};
    }

    let policies = include({
        dirname:  process.cwd() + '/app/policies',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    policies = _.mapValues(policies, function(policy) {
        if (policy.length === 1) {
            return policy(mycro);
        } else {
            return policy();
        }
    });

    _.extend(mycro.policies, policies);

    return async.setImmediate(done);
};
