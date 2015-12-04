'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function(cb) {
    var self = this;
    self.log('silly', '[services] hook starting');
    self.name = 'services';
    self.services = {};

    var controllers = include({
        dirname     :  process.cwd() + '/app/services',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    _.extend(self.services, controllers);
    self.log('info', '[services] hook complete');
    cb();
};
