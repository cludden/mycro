'use strict';

var sinon = require('sinon');

module.exports = {

    registerConnection: function(config, cb) {
        return cb(null, {});
    },

    registerModel: function(connection, definition, cb) {
        cb(null, {
            find: sinon.stub(),
            findOne: sinon.stub()
        });
    },

    blueprintController: function(model, actions, cb) {
        var controller = {};

        actions.forEach(function(action) {
            controller[action] = model[action];
        });

        cb(null, controller);
    }
};
