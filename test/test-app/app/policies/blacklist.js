'use strict';

const _ = require('lodash');

module.exports = function(mycro) {
    return function() {
        const items = Array.prototype.slice.call(arguments).filter(function(item) {
            return typeof item === 'string';
        });

        return function blacklist(req, res, next) {
            req.options.blacklist = req.options.blacklist || [];
            req.options.blacklist = _.uniq(req.options.blacklist.concat(items));
            mycro.log('silly', '[policy] blacklist: added to blacklist:', items);
            res.set('x-blacklist', items.join(','));
            next();
        };
    };
};
