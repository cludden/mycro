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
        req.mycro.log('silly', '[policy] blacklist: added to blacklist:', items);
        res.set('x-blacklist', items.join(','));
        next();
    };
};
