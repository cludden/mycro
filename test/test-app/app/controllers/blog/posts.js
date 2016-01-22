'use strict';

module.exports = {
    create: function(req, res) {
        req.mycro.controllers['rest'].create(req, res);
    }
};
