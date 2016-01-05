'use strict';

module.exports = {
    '/test': {
        get: function(req, res) {
            res.json(200, {message: 'ok'});
        }
    }
};
