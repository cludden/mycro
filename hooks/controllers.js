'use strict';

var include = require('include-all'),
    _ = require('lodash');

module.exports = function Controllers(cb) {
    var self = this;
    self.controllers = {};

    var controllers = include({
        dirname:  process.cwd() + '/app/controllers',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    controllers = _.mapValues(controllers, function(constructor) {
        if (typeof constructor === 'function') {
            return constructor(self);
        }
        return constructor;
    });

    _.extend(self.controllers, controllers);
    cb();
};
