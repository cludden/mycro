'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function(cb) {
    var self = this;
    self.log('silly', '[controllers] hook starting');

    var controllers = include({
        dirname     :  process.cwd() + '/app/controllers',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    _.extend(self.controllers, controllers);
    self.log('info', '[controllers] hook complete');
    cb();
};
