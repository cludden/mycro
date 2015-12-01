'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function(cb) {
    var self = this;

    var controllers = include({
        dirname     :  process.cwd() + '/api/controllers',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    _.extend(self.controllers, controllers);
    cb();
};
