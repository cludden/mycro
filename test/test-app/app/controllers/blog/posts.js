'use strict';

module.exports = {
    create: function(req, res) {
        req.microservice.controllers['rest'].create(req, res);
    }
};
