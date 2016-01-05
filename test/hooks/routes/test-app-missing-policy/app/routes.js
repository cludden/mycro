'use strict';

module.exports = {
    '/test': {
        policies: [
            'authenticated'
        ],
        get: function(req, res) {
            res.json(200, {message: 'authenticated'});
        }
    }
};
