'use strict';

var async = require('async'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function(cb) {
    var self = this;
    self.log('silly', '[models] hook starting');

    var models = include({
        dirname: process.cwd() + '/app/models',
        filter      :  /(.+)\.js$/,
        optional    :  true
    });

    async.mapLimit(_.keys(models), 5, function(name, fn) {
        // get model definition
        var modelDefinition = models[name];
        modelDefinition.name = name;

        // get connection name
        var connectionName = modelDefinition.connection || self._config.models.connection || false;
        if (!connectionName) return fn('No connection name specified for model (' + name + ')');

        // get connection
        var connection = connectionName ? self.connections[connectionName] : false;
        if (!connection) return fn('Unable to find connection object for connection (' + connectionName + ')');

        // get adapter
        var adapter = connection.adapter;
        if (!adapter) return fn('Unable to find adapter for connection (' + connectionName + ')');

        // validate handler exists
        if (!adapter.registerModel || !_.isFunction(adapter.registerModel)) {
            return fn('Invalid adapter api: Adapters must implement a #registerModel() method');
        }

        // validate handler signature
        if (adapter.registerModel.length !== 3) {
            return fn('Invalid adapter api: #regsiterModel() accepts a model definition object and a callback');
        }

        // hand off to adapter
        adapter.registerModel(connection.connection, modelDefinition, function(err, model) {
            if (err) return fn(err);
            self.models[name] = model;
            fn();
        });
    }, function(err) {
        if (err) {
            self.log('error', '[models] error: ' + err);
            return cb(err);
        }
        self.log('info', '[models] hook complete');
        return cb();
    });
};
