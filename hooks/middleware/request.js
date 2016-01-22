'use strict';

/**
 * Configure the base request object. Make the mycro object
 * available on the request. Configure defaults for req.options
 *
 * @param  {Object} mycro
 */
module.exports = function(mycro) {
    return function request(req, res, next) {
        // attach the mycro to each request
        req.mycro = mycro;

        // define request attributes
        req.options = {};

        next();
    };
};
