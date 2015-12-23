'use strict';

module.exports = {
    goodbye: function(req, res) {
        res.json(200, {message: 'Goodbye ' + req.params[0] + '!'});
    },

    hello: function(req, res) {
        res.json(200, {message: 'Hello ' + req.params[0] + '!'});
    }
};
