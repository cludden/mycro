'use strict';

const _ = require('lodash');

module.exports = {
    findConnection: function(mycro, modelName) {
        return _.find(mycro.connections, function(config) {
            if (!config.models.length) {
                return false;
            }
            const match = _.find(config.models, function(path) {
                return path.test(modelName);
            });
            return match !== undefined;
        });
    }
};
