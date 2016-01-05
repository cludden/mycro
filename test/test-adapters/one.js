'use strict';

var _ = require('lodash');

module.exports = {
    registerConnection: function(config, cb) {
        setTimeout(function() {
            cb(null, {
                models: {},
                define: function(name, definition) {
                    this.models[name] = definition;
                    return {
                        create: _.noop,
                        destroy: _.noop,
                        find: _.noop,
                        findOne: _.noop,
                        update: _.noop
                    };
                }
            });
        }, 50);
    },

    registerModel: function(connection, definition, cb) {
        try {
            var model = definition(connection);
            return cb(null, model);
        } catch (e) {
            return cb(e);
        }
    }
};
