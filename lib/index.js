'use strict';

import async from 'async';
import EventEmitter from 'events';
import include from 'include-all';
import stacktrace from 'stack-trace';
import util from 'util';
import _ from 'lodash';


export default class Mycro {
    constructor(runtimeConfig) {
        const mycro = this;

        // inherit from EventEmitter
        EventEmitter.call(mycro);

        // set defauts
        mycro.appPath = stacktrace.get()[1].getFileName().split('/').slice(0,-1).join('/');
        mycro.version = require('../package.json').version;


        // initialize any config files, passing the mycro instance to any that
        // export functions
        const includeOptions = {
            defaults: {
                dirname: __dirname + '/config',
                filter:  /(.+)\.js$/,
                optional:  true
            },
            user: {
                dirname: mycro.appPath + '/config',
                filter:  /(.+)\.js$/,
                optional: true
            }
        };
        const config = ['defaults', 'user'].reduce(function(result, type) {
            const options = includeOptions[type];
            const included = _.mapValues(include(options), function(c) {
                return _.isFunction(c) ? c(mycro) : c;
            });
            return _.merge(result, included);
        }, {});
        mycro.config = _.merge(config, runtimeConfig || {});


        // instantiate logger
        const Logger = _.get(mycro.config, 'log.logger');
        if (_.isFunction(Logger)) {
            mycro.logger = new Logger(_.get(mycro.config, 'log.options', {}));
            mycro.log = function(...args) {
                mycro.logger.log.apply(mycro.logger, args);
            };
        } else {
            mycro.log = _.noop;
        }


        // resolve hooks
        const hooks = _.reduce(_.get(mycro.config, 'hooks', []), function(queue, hook) {
            if (_.isFunction(hook)) {
                queue.push(hook);
                mycro.log('info', `[mycro] hook loaded: ${hook.name}`);
            } else if (_.isString(hook)) {
                const resolved = _.attempt(function() {
                    return require(hook);
                });
                if (_.isError(resolved)) {
                    mycro.log('error', `[mycro] unable to load hook: ${hook}`);
                    throw resolved;
                }
                queue.push(resolved);
                mycro.log('info', `[mycro] hook loaded: ${hook}`);
            }
            return queue;
        }, []);


        /**
         * Process hooks
         * @param  {Function} done
         */
        mycro.start = function start(done) {
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


    /**
     * Provide fallback getter for old _config reference
     * @return {Object}
     */
    get _config() {
        this.log('info', `[DEPRECATION] mycro._config has been deprecated, please use mycro.config`);
        return this.config;
    }
}

util.inherits(Mycro, EventEmitter);
