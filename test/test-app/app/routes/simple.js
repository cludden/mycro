'use strict';

module.exports = {
    '/simple': {
        get: {
            options: {
                simple: true
            },
            handler: function(req, res) {
                res.json(200, {simple: true});
            }
        }
    }
};
