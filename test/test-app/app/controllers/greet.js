'use strict';

module.exports = function(mycro) {
    return {
        goodbye: function(req, res) {
            res.json(200, {message: 'Goodbye ' + req.params[0] + '!'});
        },

        hello: function(req, res) {
            res.json(200, {message: 'Hello ' + req.params[0] + '!'});
        },

        index: function(req, res) {
            res.json(200, {message: 'Hello from the index method!'});
        }
    };
};
