'use strict';
var _ = require('lodash');

module.exports = function Blueprints(cb) {
    var self = this,
        blueprints = self._config.blueprints,
        options = ['prefix'], // TODO note reserved option keywords in docs
        allowedActions = {
            find: 'get',
            findOne: 'get',
            create: 'post',
            update: 'put',
            destroy: 'del'
        },
        error = function(message, callback) {
            self.log('error', '[Blueprints] ' + message);
            return callback(new Error(message));
        };

    // exit if undefined
    if(!blueprints) {
        return cb(null);
    }

    // iterate through blueprint config attributes
    _.forIn(blueprints, function(connectionBlueprint, connectionName) {

        // ignore config options
        if(_.includes(options, connectionName)) {
            return;
        }

        // verify connection
        var connection = self.connections[connectionName];
        if(!connection) {
            return error('invalid connection ' + connectionName, cb);
        }

        // iterate connection blueprint models
        _.forIn(connectionBlueprint, function(actions, modelName) {

            // verify model
            var model = self.models[modelName];
            if(!model) {
                return error('invalid model ' + modelName, cb);
            }

            // verify actions
            actions = _.isArray(actions) ? actions : [actions];
            actions = _.includes(actions, '*') ? _.keys(allowedActions) : actions;
            if(!actions.length) {
                return error('no actions provided for model ' + modelName, cb);
            }
            actions.forEach(function(action) {
                if(!allowedActions[action] && action !== '*') {
                    return error('invalid blueprint action ' + action, cb);
                }
            });

            // create microservice.controllers
            self.controllers = {};

            // get blueprint controller from adapter
            connection.adapter.blueprintController(model, actions, function(err, controller) {
                if(err) {
                    return error(err, cb);
                } else {
                    self.controllers[modelName] = controller;

                    // create blueprint routes (can override in routes config to apply policies, etc.)
                    // TODO route versioning?
                    actions.forEach(function(action) {
                        var verb = allowedActions[action],
                            route = blueprints.prefix + '/' + modelName;
                        self.log('silly', '[hook] blueprints :: binding route ' + verb.toUpperCase() + ' ' + route);
                        self.server[verb](route, self.controllers[modelName][action]);
                    });

                    return cb(null);
                }
            });
        });
    });
};