'use strict';

var asyncjs = require('async'),
    include = require('include-all'),
    lib = require('./models/index'),
    _ = require('lodash');

module.exports = function Models(cb) {
    var mycro = this;
    mycro.models = {};

    var modelDefinitions = include({
        dirname: process.cwd() + '/app/models',
        filter:  /(.+)\.js$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    var modelNames = _.keys(modelDefinitions);
    if (!modelNames || !modelNames.length) {
        return cb();
    }

    var defaultConnection = _.find(mycro.connections, function(config) {
        return config.default === true;
    });

    asyncjs.auto({
        // hand model definitions to the appropriate adapter for construction
        build: function(fn) {
            asyncjs.each(modelNames, function(name, _fn) {
                // get model definition
                var modelDefinition = modelDefinitions[name];
                modelDefinition.__name = name;

                // get connection info
                var connectionInfo = lib.findConnection(mycro, name);
                if (!connectionInfo) {
                    mycro.log('silly', '[models] Unable to find explicit adapter for model (' + name + ')');
                    if (!defaultConnection ) {
                        return _fn('Unable to find adapter for model (' + name + ')');
                    } else {
                        connectionInfo = defaultConnection;
                    }
                }

                // validate handler exists
                var adapter = connectionInfo.adapter;
                if (!adapter.registerModel || !_.isFunction(adapter.registerModel) || adapter.registerModel.length < 3) {
                    return _fn('Invalid adapter api: adapters should define a `registerModel` method that accepts a connection object, model definition object, and a callback');
                }

                // hand off to adapter
                var registerModelCallback = function(err, model) {
                    if (err) {
                        return _fn(err);
                    }
                    if (!model) {
                        return _fn('No model (' + name + ') returned from `adapter.registerModel`');
                    }
                    mycro.models[name] = model;
                    _fn();
                };
                if (adapter.registerModel.length === 3) {
                    return adapter.registerModel(connectionInfo.connection, modelDefinition, registerModelCallback);
                } else {
                    return adapter.registerModel(connectionInfo.connection, modelDefinition, name, registerModelCallback);
                }
            }, fn);
        },

        // once all models have been built, allow each adapter the opportunity to
        // do additional processing
        process: ['build', function(fn) {
            var adapters = _.values(mycro.connections).map(function(connectionInfo) {
                return connectionInfo.adapter;
            });

            asyncjs.each(adapters, function(adapter, _fn) {
                if (!adapter || !_.isFunction(adapter.processModels)) {
                    return _fn();
                }
                adapter.processModels(mycro.models, modelDefinitions, _fn);
            }, fn);
        }]
    }, cb);
};
