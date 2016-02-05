'use strict';

var asyncjs = require('async'),
    pathToRegex = require('path-to-regexp'),
    _ = require('lodash');

module.exports = function Connections(cb) {
    var self = this;
    self.connections = {};

    var connections = _.keys(this._config.connections);
    if (!connections.length) {
        return cb();
    }

    asyncjs.mapLimit(connections, 5, function(connectionName, fn) {
        var connectionInfo = self._config.connections[connectionName];

        // verify adapter info, be forgiving with spelling
        var adapter = connectionInfo.adapter;
        if (!adapter) {
            return fn('Missing adapter for connection: ' + connectionName);
        }

        // verify the adapter implements a `registerConnection` method
        if (!adapter.registerConnection || !_.isFunction(adapter.registerConnection) || adapter.registerConnection.length !== 2) {
            return fn('Invalid adapter api. Adapters should define a `registerConnection` method that accepts a config object and callback function');
        }

        // allow for dynamic connection config at hook runtime
        if (_.isFunction(connectionInfo.config)) {
            try {
                connectionInfo.config = connectionInfo.config(self);
            } catch (e) {
                /* istanbul ignore next */
                return fn(e);
            }
        }

        adapter.registerConnection(connectionInfo.config, function(err, connection) {
            if (err) {
                return fn('There was an error creating the connection (' + connectionName + ')');
            }
            if (!connection) {
                return fn('No connection object was returned by the adapter (' + connectionInfo.adapter + ') for a connection (' + connectionInfo.name + ')');
            }
            self.connections[connectionName] = {
                adapter: adapter,
                connection: connection,
                default: connectionInfo.default || connections.length === 1,
                models: (connectionInfo.models || []).map(function(path) {
                    return pathToRegex(path);
                })
            };
            fn();
        });
    }, function(err) {
        if (err) return cb(err);
        return cb();
    });
};
