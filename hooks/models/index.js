'use strict';

var _ = require('lodash');

module.exports = {
    findConnection: function(microservice, modelName) {
        return _.find(microservice.connections, function(config) {
            if (!config.models.length) {
                return false;
            }
            var match = _.find(config.models, function(path) {
                return path.test(modelName);
            });
            return match !== undefined;
        });
    }
};
