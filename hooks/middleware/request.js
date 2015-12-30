'use strict';

/**
 * Configure the base request object. Make the microservice object
 * available on the request. Configure defaults for req.options
 *
 * @param  {Object} microservice
 */
module.exports = function(microservice) {
    return function request(req, res, next) {
        // attach the microservice to each request
        req.microservice = microservice;

        // define request attributes
        req.options = {};

        next();
    };
};
