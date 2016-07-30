'use strict';

const async = require('async');
const EventEmitter = require('events');
const include = require('include-all');
const _ = require('lodash');

function Mycro(config) {
    const mycro = this;

    // inherit from EventEmitter
    EventEmitter.call(mycro);

    // set defauts
    mycro._config = config || {};
    mycro._version = require('./package.json').version;

    // gather default config
    let defaults = include({
        dirname: __dirname + '/config',
        filter:  /(.+)\.js$/,
        optional:  true
    });

    // gather user config
    let userConfig = include({
        dirname: process.cwd() + '/config',
        filter:  /(.+)\.js$/,
        optional: true
    });

    // initialize any config files that export constructors
    // note: if constructors expect a single argument, the microservice will be
    // passed as the sole argument
    defaults = _.mapValues(defaults, function(fn) {
        if (typeof fn === 'function') {
            return fn(mycro);
        }
        return fn;
    });
    userConfig = _.mapValues(userConfig, function(fn) {
        if (typeof fn === 'function') {
            return fn(mycro);
        }
        return fn;
    });


    // create microservice config and store it on the service object
    mycro._config = _.defaults(_.extend(userConfig, mycro._config), defaults);

    // configure logger settings
    mycro.logger = new mycro._config.logger(mycro._config.log);
    mycro.log = function() {
        mycro.logger.log.apply(mycro.logger, Array.prototype.slice.call(arguments));
    };

    mycro._hooks = [];
    mycro._config.hooks.forEach(function(hook) {
        if (_.isFunction(hook)) {
            mycro._hooks.push(hook);
            mycro.log('silly', '[init] loading hook: ' + hook.name);
            return;
        }

        if (_.isString(hook)) {
            let resolved;
            try {
                resolved = require('./hooks/' + hook);
                mycro._hooks.push(resolved);
                mycro.log('silly', '[init] loading hook: ' + hook);
                return;
            } catch (err) {
                try {
                    resolved = require(hook);
                    mycro._hooks.push(resolved);
                    mycro.log('silly', '[init] loading hook: ' + hook);
                    return;
                } catch (e) {
                    mycro._hooks.push(function(cb) {
                        mycro.log('error', 'error loading hook: ' + hook);
                        cb(e);
                    });
                    return;
                }
            }
        }
    });

    mycro.start = function(done) {
        async.eachSeries(
            mycro._hooks,
            function(hook, fn) {
                return hook.call(mycro, function(err) {
                    if (err) {
                        mycro.log('error', '[' + hook.name + ']', err);
                        return fn(err);
                    }
                    mycro.log('info', '[' + hook.name + '] hook loaded successfully');
                    fn();
                });
            },
            done
        );
    };
}

module.exports = Mycro;
