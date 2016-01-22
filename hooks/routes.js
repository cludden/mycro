'use strict';

var include = require('include-all'),
    _ = require('lodash');

module.exports = function restify_mycro_nested_routes(cb) {
    return module.exports.hook.call(this, cb);
};

module.exports.hook = function(cb) {
    var mycro = this;

    var definition;
    try {
        definition = require(process.cwd() + '/app/routes');
        if (_.isFunction(definition)) definition = definition(mycro);
    } catch (err) {
        mycro.log('info', '[Routes] no routes found');
        return cb(err);
    }

    var routes = include({
        dirname:  process.cwd() + '/app/routes',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    var defaultVersion = mycro._config.server.version || '1.0.0';

    var lib = require('./routes/index');
    lib.handleDefinition(mycro, {
        currentPath: '',
        definition: definition,
        regexPathDefinition: '',
        routes: routes,
        version: defaultVersion
    }, cb);
};
