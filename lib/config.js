'use strict';

var include = require('include-all'),
    _ = require('lodash');

module.exports = function(cb) {
    var self = this;

    var defaults = include({
        dirname: __dirname + '/../config',
        filter      :  /(.+)\.js$/,
        optional    :  true
    });

    var userConfig = include({
        dirname: process.cwd() + '/config',
        filter      :  /(.+)\.js$/,
        optional    :  true
    });

    self._config = _.defaults(_.extend(userConfig, self._config), defaults);
    cb();
};