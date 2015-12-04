'use strict';

var async = require('async'),
    _ = require('lodash');

module.exports = function(cb) {
    var self = this;
    self.log('silly', '[connections] starting hook');
    self.name = 'connections';
    self.connections = {};

    var connections = _.keys(this._config.connections);
    if (!connections.length) {
        return cb();
    }

    async.mapLimit(connections, 5, function(connectionName, fn) {
        var connectionInfo = self._config.connections[connectionName];
        connectionInfo.name = connectionName;

        // verify adapter info, be forgiving with spelling
        var adapter = connectionInfo.adapter || connectionInfo.adaptor || false;
        if (!adapter) return fn('Missing adapter for connection: ' + connectionName);


        // verify the adapter implements a `registerConnection` method
        if (!adapter.registerConnection || !_.isFunction(adapter.registerConnection) || adapter.registerConnection.length !== 2) {
            return fn('Invalid adapter api');
        }

        adapter.registerConnection(connectionInfo, function(err, connection) {
            if (err) {
                console.log(err);
                return fn('There was an error creating the connection (' + connectionName + ')');
            }
            if (!connection) return fn('No connection object was returned by the adapter (' + connectionInfo.adapter + ') for a connection (' + connectionInfo.name + ')');
            self.connections[connectionName] = {
                adapter: adapter,
                connection: connection
            };
            fn();
        });
    }, function(err) {
        if (err) {
            self.log('error', '[connections] error: ' + err);
            return cb(err);
        }
        self.log('info', '[connections] hook complete');
        return cb();
    });
};
