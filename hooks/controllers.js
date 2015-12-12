'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function Controllers(cb) {
    var self = this;
    self.controllers = {};

    var controllers = include({
        dirname     :  process.cwd() + '/app/controllers',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    _.extend(self.controllers, controllers);
    cb();
};
