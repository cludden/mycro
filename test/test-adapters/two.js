'use strict';

var asyncjs = require('async'),
    _ = require('lodash');

module.exports = {
    processModels: function(models, definitions, cb) {
        asyncjs.each(_.keys(definitions), function(modelName, fn) {
            var definition = definitions[modelName];
            if (!definition.associations) {
                return fn();
            }
            var error;
            var noerrors = _.every(definition.associations, function(association, attr) {
                var otherModel = models[association.model];
                if (!otherModel) {
                    error = 'Unable to find associated model (' + association.model +
                        ') for model\'s (' + modelName + ') association (' + attr + ')';
                    return false;
                }
                models[modelName][association.type](attr, otherModel);
                return true;
            });
            if (!noerrors) {
                return fn(error);
            }
            fn();
        }, cb);
    },


    registerConnection: function(config, cb) {
        var models = [];
        setTimeout(function() {
            cb(null, {
                modelNames: function() {
                    return models.slice();
                },
                model: function(name) {
                    models.push(name);
                    return {
                        belongsTo: _.noop,
                        belongsToMany: _.noop,
                        create: _.noop,
                        destroy: _.noop,
                        find: _.noop,
                        findOne: _.noop,
                        hasMany: _.noop,
                        hasOne: _.noop,
                        update: _.noop
                    };
                }
            });
        }, 25);
    },

    registerModel: function(connection, definition, name, cb) {
        try {
            var model = definition.define(connection);
            return cb(null, model);
        } catch (e) {
            return cb(e);
        }
    }
};
