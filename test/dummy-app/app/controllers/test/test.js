'use strict';

var _ = require('lodash');

module.exports = {
    bodyParams: function(req, res) {
        res.json(200, {body: req.body});
    },

    requestAll: function(req, res) {
        var params = req.allParams();
        res.json(200, {params: params});
    },

    queryParams: function(req, res) {
        var queryParams = _.keys(req.params);
        res.json(200, {queryParams: queryParams});
    }
};
