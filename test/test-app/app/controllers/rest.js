'use strict';

module.exports = {
    create: function(req, res) {
        var model = req.options.model;
        req.mycro.services['data'].create(model, req.body, function(err, record) {
            if (err) {
                return res.json(500, {error: err});
            }
            res.json(200, record);
        });
    },

    detail: function(req, res, next) {
        var model = req.options.model;
        req.mycro.services['data'].detail(model, parseInt(req.params.id), function(err, record) {
            if (err) {
                res.json(500, {error: err});
                return next(err);
            }
            res.json(200, record);
            next();
        });
    },

    find: function(req, res) {
        req.mycro.log('silly', 'rest.find called for model:', req.options.model, 'with query:', JSON.stringify(req.query));
        var model = req.options.model;
        req.mycro.services['data'].find(model, req.query, function(err, records) {
            if (err) {
                return res.json(500, {error: err});
            }
            res.json(200, records);
        });
    },

    remove: function(req, res) {
        var model = req.options.model;
        req.mycro.services['data'].remove(model, req.params.id, function(err, removed) {
            if (err) {
                return res.json(500, {error: err});
            }
            res.json(200, removed);
        });
    },

    update: function(req, res) {
        var model = req.options.model;
        req.mycro.services['data'].update(model, req.params.id, req.body, function(err, updated) {
            if (err) {
                return res.json(500, {error: err});
            }
            res.json(200, updated);
        });
    }
};
