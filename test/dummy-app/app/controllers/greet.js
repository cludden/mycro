'use strict';

module.exports = {
    aloha: function(req, res) {
        res.json(200, {message: 'Aloha, ' + req.params[0] + '!'});
    },

    hello: function(req, res) {
        res.json(200, {message: 'Hello, ' + req.params.name + '!'});
    }
};
