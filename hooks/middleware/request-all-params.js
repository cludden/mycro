'use strict';

var _ = require('lodash'),
    defaultsDeep = require('merge-defaults');

/**
 * Configure the base request object. Make the microservice object
 * available on the request. Configure defaults for req.options
 *
 * @param  {Object} microservice
 */
module.exports = function(microservice) {
    return function request(req, res, next) {
        var queryParams = _.clone(req.query, true),
            bodyParams = _.clone(req.query, true),
            params = {};

        defaultsDeep(params, queryParams);
        defaultsDeep(params, bodyParams);

        _.each(req.params, function(value, param) {
            params[param] = params[param] || value;
        });

        req.allParams = function() {
            return params;
        };

        next();
    };
};
