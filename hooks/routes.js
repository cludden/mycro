'use strict';

var asyncjs = require('async'),
    include = require('include-all'),
    supportedMethods = ['del', 'get', 'head', 'post', 'put'],
    _ = require('lodash');

module.exports = function restify_microservice_nested_routes(cb) {
    return module.exports.hook.call(this, cb);
};

module.exports.hook = function(cb) {
    var microservice = this;

    var definition;
    try {
        definition = require(process.cwd() + '/app/routes');
        if (_.isFunction(definition)) definition = definition(microservice);
    } catch (err) {
        microservice.log('info', '[Routes] no routes found');
        return cb();
    }

    var routes = include({
        dirname:  process.cwd() + '/app/routes',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    var defaultVersion = microservice._config.server.version || '1.0.0';

    var lib = require('./routes/index');
    lib.handleDefinition(microservice, {
        currentPath: '',
        definition: definition,
        regexPathDefinition: '',
        routes: routes,
        version: defaultVersion
    }, cb);
};
