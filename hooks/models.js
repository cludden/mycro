'use strict';

const async = require('async');
const include = require('include-all');
const lib = require('./models/index');
const _ = require('lodash');

module.exports = function models(done) {
    const mycro = this;

    if (!_.isObject(mycro.models)) {
        mycro.models = {};
    }

    const modelDefinitions = include({
        dirname: process.cwd() + '/app/models',
        filter:  /(.+)\.js$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    const modelNames = _.keys(modelDefinitions);
    if (!modelNames || !modelNames.length) {
        return async.setImmediate(done);
    }

    const defaultConnection = _.find(mycro.connections, function(config) {
        return config.default === true;
    });

    async.auto({
        // hand model definitions to the appropriate adapter for construction
        build: function(fn) {
            async.each(modelNames, function(name, _fn) {
                // get model definition
                const modelDefinition = modelDefinitions[name];
                modelDefinition.__name = name;

                // get connection info
                let connectionInfo = lib.findConnection(mycro, name);
                if (!connectionInfo) {
                    mycro.log('silly', '[models] Unable to find explicit adapter for model (' + name + ')');
                    if (!defaultConnection ) {
                        return _fn('Unable to find adapter for model (' + name + ')');
                    } else {
                        connectionInfo = defaultConnection;
                    }
                }

                // validate handler exists
                const adapter = connectionInfo.adapter;
                if (!adapter.registerModel || !_.isFunction(adapter.registerModel) || adapter.registerModel.length < 3) {
                    return _fn('Invalid adapter api: adapters should define a `registerModel` method that accepts a connection object, model definition object, and a callback');
                }

                // hand off to adapter
                const registerModelCallback = function(err, model) {
                    if (err) {
                        return _fn(err);
                    }
                    if (!model) {
                        return _fn('No model (' + name + ') returned from `adapter.registerModel`');
                    }
                    mycro.models[name] = model;
                    async.setImmediate(_fn);
                };

                if (adapter.registerModel.length === 3) {
                    return adapter.registerModel(connectionInfo.connection, modelDefinition, registerModelCallback);
                } else if (adapter.registerModel.length === 4) {
                    return adapter.registerModel(connectionInfo.connection, modelDefinition, name, registerModelCallback);
                } else {
                    return adapter.registerModel(connectionInfo.connection, modelDefinition, name, mycro, registerModelCallback);
                }
            }, fn);
        },

        // once all models have been built, allow each adapter the opportunity to
        // do additional processing
        process: ['build', function(fn) {
            const adapters = _.values(mycro.connections).map(function(connectionInfo) {
                return connectionInfo.adapter;
            });

            async.each(adapters, function(adapter, _fn) {
                if (!adapter || !_.isFunction(adapter.processModels)) {
                    return _fn();
                }
                adapter.processModels(mycro.models, modelDefinitions, _fn);
            }, fn);
        }]
    }, done);
};
