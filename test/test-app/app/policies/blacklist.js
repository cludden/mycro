'use strict';

var _ = require('lodash');

module.exports = function() {
    var items = Array.prototype.slice.call(arguments).filter(function(item) {
        return typeof item === 'string';
    });

    return function(req, res, next) {
        req.options = req.options || {};
        req.options.blacklist = req.options.blacklist || [];
        req.options.blacklist = _.uniq(req.options.blacklist.concat(items));
        req.microservice.log('silly', '[policy] blacklist executed');
        next();
    };
};
