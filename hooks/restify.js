'use strict';

const async = require('async');
const restify = require('restify');
const include = require('include-all');
const _ = require('lodash');

module.exports = function server(done) {
    const mycro = this;

    // store a reference to this restify
    mycro._restify = restify;

    // locate user defined server config and create server
    const config = mycro._config.server.config;
    mycro.server = restify.createServer(config);

    // load common middleware
    let standardMiddlewares = include({
        dirname     :  __dirname + '/middleware',
        filter      :  /(.+)\.js$/,
        excludeDirs :  /^\.(git|svn)$/,
        optional    :  true
    });

    standardMiddlewares = _.mapValues(standardMiddlewares, function(middleware) {
        return middleware(mycro);
    });

    // filter and sort middleware
    const middlewareConfig = mycro._config.server.middleware || [];
    middlewareConfig.forEach(function(middleware) {
        if (_.isFunction(middleware)) {
            mycro.log('silly', '[Server] loading middleware: ' + middleware.name);
            return mycro.server.use(middleware(mycro));
        }
        if (_.isString(middleware)) {
            const fn = standardMiddlewares[middleware];
            if (fn) {
                mycro.log('silly', '[Server] loading middleware: ' + middleware);
                return mycro.server.use(fn);
            }
        }
    });

    return async.setImmediate(done);
};
