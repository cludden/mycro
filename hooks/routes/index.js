'use strict';

var asyncjs = require('async'),
    joi = require('joi'),
    pathToRegex = require('path-to-regexp'),
    _ = require('lodash');

module.exports = {
    /**
     * Process a route node
     *
     * @param  {Object} options
     * @param  {Function} cb
     */
    handleDefinition: function handleDefinition(mycro, options, cb) {
        var self = this;
        asyncjs.auto({
            // validate arguments
            validate: function validateOptions(fn) {
                var valid = joi.object({
                    currentPath: joi.string().allow('').default(''),
                    defaultOptions: joi.object().default({}),
                    defaultPolicies: joi.array().items(joi.string(), joi.func()).default([]),
                    definition: joi.alternatives().try(joi.object(), joi.string()).required(),
                    isRegex: joi.boolean().default(false),
                    //path: joi.string().default(''),
                    regexPathDefinition: joi.string().allow('').default(''),
                    routes: joi.object().default({}),
                    version: joi.string().regex(/^v?\d+\.\d+\.\d+$/).default('1.0.0')
                }).required();

                joi.validate(options, valid, {}, function(err, validated) {
                    if (err) {
                        return fn(err);
                    }
                    options = validated;
                    fn();
                });
            },

            // process definition
            definition: ['validate', function processDefinition(fn) {
                var definition = options.definition;
                // handle string definition by looking up inclusion in available routes
                if (_.isString(definition)) {
                    definition = options.routes[options.definition];
                    if (_.isFunction(definition)) {
                        definition = definition(mycro);
                    }
                    return fn(null, definition);
                }

                // augment route definition with any specified includes
                if (definition.routes && _.isString(definition.routes)) {
                    var routesToInclude = options.routes[definition.routes];
                    if (_.isFunction(routesToInclude)) {
                        routesToInclude = routesToInclude(mycro);
                    }
                    _.defaults(definition, routesToInclude);
                }
                fn(null, options.definition);
            }],

            // process definition keys
            options: ['definition', function processDefnition(fn, r) {
                self.handleOptions(options, r.definition, fn);
            }],

            // bind routes defined at the current level
            routes: ['options', function bindRoutes(fn, r) {
                asyncjs.each(['del', 'get', 'head', 'post', 'put'], function(verb, _fn) {
                    if (r.definition[verb]) {
                        var routeOptions = _.cloneDeep(options);
                        return self.handleRoute(mycro, verb, options.currentPath, r.definition[verb], routeOptions, _fn);
                    }
                    _fn();
                }, fn);
            }],

            // handle subpaths
            subpaths: ['routes', function bindSubPaths(fn, r) {
                asyncjs.each(_.keys(r.definition), function(key, _fn) {
                    if (!/^\//g.test(key)) {
                        return _fn();
                    }
                    var subOptions = _.cloneDeep(options);
                    subOptions.currentPath = key;
                    subOptions.definition = r.definition[key];
                    self.handleDefinition(mycro, subOptions, _fn);
                }, fn);
            }],

            // handle different versions
            versions: ['subpaths', function bindVersions(fn, r) {
                asyncjs.each(_.keys(r.definition), function(key, _fn) {
                    if (!/^v?\d+\.\d+\.\d+/g.test(key)) {
                        return _fn();
                    }
                    var subOptions = _.cloneDeep(options);
                    subOptions.version = key.replace(/v/g, '');
                    subOptions.definition = r.definition[key];
                    self.handleDefinition(mycro, subOptions, _fn);
                }, fn);
            }]
        }, cb);
    },


    handleOptions: function(currentOptions, definition, cb) {
        // augment request options
        if (definition.options) {
            _.extend(currentOptions.defaultOptions, definition.options);
        }

        // override policy chain
        if (definition.policies && _.isArray(definition.policies)) {
            currentOptions.defaultPolicies = definition.policies;
        }

        // add to policy chain
        if (definition.additionalPolicies && _.isArray(definition.additionalPolicies)) {
            currentOptions.defaultPolicies = currentOptions.defaultPolicies.concat(definition.additionalPolicies);
        }

        // update regex flag based on definition
        if (definition.regex === true) {
            currentOptions.isRegex = true;
        }

        // add to path definition and build current path
        currentOptions.regexPathDefinition += currentOptions.currentPath;
        if (currentOptions.isRegex) {
            currentOptions.currentPath = pathToRegex(currentOptions.regexPathDefinition);
        } else {
            currentOptions.currentPath = currentOptions.regexPathDefinition;
        }
        cb();
    },


    handleRoute: function(mycro, verb, path, handler, options, cb) {
        var self = this;
        asyncjs.auto({
            // process handler definition
            handler: function processHandler(fn) {
                if (_.isFunction(handler)) {
                    return fn(null, handler);
                }
                if (_.isString(handler)) {
                    return self.processStringHandler(mycro, handler, fn);
                }
                if (_.isObject(handler)) {
                    // make sure the object defines a `handler` attribute
                    if (!handler.handler) {
                        return fn('Unable to locate handler for ' + verb.toUpperCase() + ' ' + path.toString());
                    }
                    // extend options with any route specific options
                    if (handler.options && _.isObject(handler.options)) {
                        _.extend(options.defaultOptions, handler.options);
                    }
                    // allow route to override policy chain
                    if (handler.policies && _.isArray(handler.policies)) {
                        options.defaultPolicies = handler.policies;
                    }
                    // allow route to augment policy chain
                    if (handler.additionalPolicies && _.isArray(handler.additionalPolicies)) {
                        options.defaultPolicies = options.defaultPolicies.concat(handler.additionalPolicies);
                    }
                    if (_.isFunction(handler.handler)) {
                        return fn(null, handler.handler);
                    }
                    if (_.isString(handler.handler)) {
                        return self.processStringHandler(mycro, handler.handler, fn);
                    }
                }
                return fn('Unsupported handler type for '+ verb.toUpperCase() + ' ' + path.toString());
            },

            bind: ['handler', function bindRoute(fn, r) {
                // define the base policy chain with a single function that
                // defines the request options
                var policyChain = [
                    {
                        path: path,
                        version: options.version
                    },
                    function(req, res, next) {
                        /* istanbul ignore next */
                        req.options = req.options || {};
                        _.extend(req.options, options.defaultOptions);
                        next();
                    }
                ];
                // add the current policy chain
                policyChain = policyChain.concat(options.defaultPolicies);
                policyChain.push(r.handler);

                // process string policies
                var policyError;
                policyChain = policyChain.map(function(handler) {
                    if (_.isFunction(handler)) {
                        return handler;
                    }
                    if (_.isString(handler)) {
                        var policy = mycro.policies[handler];
                        if (!policy || !_.isFunction(policy)) {
                            policyError = 'Unable to locate function policy for ' + handler;
                            return false;
                        }
                        return policy;
                    }
                    return handler;
                });

                if (policyError) {
                    return fn('Invalid policy chain for route ' + verb.toUpperCase() + ' ' + path + ': ' + policyError);
                }

                mycro.log('silly', '[hook] routes :: binding route (v' + options.version + ')  ' + verb.toUpperCase() + (verb.length === 3 ? ' ' : '') + ' ' + path);
                try {
                    mycro.server[verb].apply(mycro.server, policyChain);
                    return fn();
                } catch (e) {
                    return fn('There was an error while attempting to bind route: ' + e);
                }
            }]
        }, function(err) {
            if (err) {
                return cb(err);
            }
            cb();
        });
    },

    processStringHandler: function(mycro, handler, cb) {
        var pieces = handler.split('.');
        if (pieces.length !== 2) {
            return cb('Unable to process string handler. Must be in format `controllerName.actionName`');
        }
        var controller = mycro.controllers[pieces[0]];
        if (!controller) {
            return cb('Unable to locate controller: ' + pieces[0]);
        }
        if (!controller[pieces[1]]) {
            return cb('Unable to locate action (' + pieces[1] + ') on controller (' + pieces[0] + ')');
        }
        if (!_.isFunction(controller[pieces[1]])) {
            return cb('Unable to bind route with non-function action (' + pieces[1] + ')');
        }
        cb(null, controller[pieces[1]]);
    }
};
