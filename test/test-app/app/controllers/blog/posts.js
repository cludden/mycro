'use strict';

module.exports = {
    create: function(req, res) {
        req.mycro.controllers['rest'].create(req, res);
    },

    index: function(req, res) {
        res.json(200, {message: 'Hello from blog/posts.index!'});
    }
};
