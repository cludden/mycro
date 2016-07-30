'use strict';

module.exports = function(mycro) {
    return {
        create: function(req, res) {
            mycro.controllers['rest'].create(req, res);
        },

        index: function(req, res) {
            res.json(200, {message: 'Hello from blog/posts.index!'});
        }
    };
};
