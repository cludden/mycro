'use strict';

const async = require('async');
const include = require('include-all');
const _ = require('lodash');

module.exports = function services(done) {
    const mycro = this;

    if (!_.isObject(mycro.services)) {
        mycro.services = {};
    }

    let services = include({
        dirname:  process.cwd() + '/app/services',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional: true
    });

    services = _.mapValues(services, function(cnt) {
        if (typeof cnt === 'function') {
            return cnt(mycro);
        }
        return cnt;
    });

    _.extend(mycro.services, services);

    async.setImmediate(done);
};
