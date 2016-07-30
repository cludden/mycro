'use strict';

const async = require('async');
const include = require('include-all');
const _ = require('lodash');

module.exports = function controllers(done) {
    const mycro = this;

    if (!_.isObject(mycro.controllers)) {
        mycro.controllers = {};
    }

    let controllers = include({
        dirname:  process.cwd() + '/app/controllers',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    controllers = _.mapValues(controllers, function(cnt) {
        if (typeof cnt === 'function') {
            return cnt(mycro);
        }
        return cnt;
    });

    _.extend(mycro.controllers, controllers);

    async.setImmediate(done);
};
