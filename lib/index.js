'use strict';

const async = require('async');
const EventEmitter = require('events');
const include = require('include-all');
const fp = require('lodash/fp');
const stacktrace = require('stack-trace');

function Mycro(runtimeConfig = {}) {
    const mycro = this;

    // inherit from EventEmitter
    EventEmitter.call(mycro);

    // set defauts
    mycro.version = require('../package.json').version;

    // initialize any config files, passing the mycro instance to any that
    // export functions
    const root = stacktrace.get()[1].getFileName().split('/').slice(0,-1).join('/');
    const includeOptions = {
        defaults: {
            dirname: __dirname + '/config',
            filter:  /(.+)\.js$/,
            optional:  true
        },
        user: {
            dirname: root + '/config',
            filter:  /(.+)\.js$/,
            optional: true
        }
    };
    const config = ['defaults', 'user'].reduce(function(result, type) {
        const options = includeOptions[type];
        const included = fp.mapValues(function(c) {
            return fp.isFunction(c) ? c(mycro) : c;
        }, include(options));
        return fp.merge(result, included);
    }, {});

    // create microservice config and store it on the service object
    mycro.config = fp.merge(config, runtimeConfig);

    // instantiate logger
    const Logger = fp.prop('log.logger', mycro.config);
    if (fp.isFunction(Logger)) {
        mycro.logger = new Logger(fp.prop('log.options', {}));
        mycro.log = function(...args) {
            mycro.logger.log.apply(mycro.logger, args);
        };
    } else {
        mycro.log = fp.noop;
    }

    // resolve hooks
    const hooks = fp.reduce(function(queue, hook) {
        if (fp.isFunction(hook)) {
            queue.push(hook);
            notifyHookLoaded.call(mycro, hook.name);
        } else if (fp.isString(hook)) {
            const resolved = fp.attempt(function() {
                return require(hook);
            });
            if (fp.isError(resolved)) {
                mycro.log('error', `[mycro] unable to load hook: ${hook}`);
                throw resolved;
            }
            queue.push(resolved);
            notifyHookLoaded.call(mycro, hook);
        }
        return queue;
    }, [], fp.get('hooks', mycro.config) || []);

    /**
     * Process hooks
     * @param  {Function} done
     */
    mycro.start = function(done) {
        async.eachSeries(
            hooks,
            function(hook, next) {
                return hook.call(mycro, function(err) {
                    if (err) {
                        mycro.log('error', `[mycro] error executing hook: ${hook.name}`);
                        mycro.log('error', err);
                        return next(err);
                    }
                    mycro.log('info', `[mycro] successfully executed hook: ${hook.name}`);
                    next();
                });
            },
            done
        );
    };
}

function notifyHookLoaded(name) {
    this.log('info', `[mycro] hook loaded: ${name}`);
}

module.exports = Mycro;
