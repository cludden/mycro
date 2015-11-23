'use strict';

var include = require('include-all'),
    _ = require('lodash');

module.exports = function() {
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
    console.log(process.cwd()  + '/config');

    var Hooks = [
        'connections',
        'models',
        'start'
    ];

    Hooks.forEach(function(hookname) {
        var hooks = self._config.hooks
        if (hooks && hooks[hookname] && _.isFunction(hooks[hookname])) {
            self[hookname] = hooks[hookname];
        } else {
            self[hookname] = require('./' + hookname);
        }
    });
};
