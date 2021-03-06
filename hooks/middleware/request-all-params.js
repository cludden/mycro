'use strict';

var _ = require('lodash'),
    defaultsDeep = require('merge-defaults');

/**
 * Configure the base request object. Make the mycro object
 * available on the request. Configure defaults for req.options
 *
 * @param  {Object} mycro
 */
module.exports = function() {
    return function request(req, res, next) {
        var queryParams = _.clone(req.query, true),
            bodyParams = _.clone(req.body, true),
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
