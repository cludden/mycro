'use strict';

var Baobab = require('baobab'),
    include = require('include-all'),
    _ = require('lodash');

module.exports = function(microservice) {
    var models = include({
        dirname:  __dirname + '/../fixtures',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    var db = new Baobab(models);

    return {
        create: function(model, values, cb) {
            try {
                db.select(model).push(values);
                return cb(null, values);
            } catch (e) {
                cb(e);
            }
        },

        detail: function(model, id, cb) {
            try {
                var record = db.select(model, {id: id}).get();
                return cb(null, record);
            } catch (e) {
                cb(e);
            }
        },

        find: function(model, criteria, cb) {
            try {
                var records = _.where(db.select(model).get(), function(record) {
                    return _.matches(record, criteria);
                });
                return cb(null, records);
            } catch (e) {
                cb(e);
            }
        },

        remove: function(model, id, cb) {
            try {
                var i = _.findIndex(db.select(model).get(), {id: id});
                if (i === -1) {
                    return cb();
                }
                var removed = db.select(model).splice([i, 1]);
                return cb(null, removed);
            } catch (e) {
                cb(e);
            }
        },

        update: function(model, id, values, cb) {
            try {
                var i = _.findIndex(db.select(model).get(), {id: id});
                if (i === -1) {
                    return cb();
                }
                var instance = db.select(model, i).get();
                var updated = _.extend(_.clone(instance), values);
                db.set([model, i], updated);
                return cb(null, updated);
            } catch (e) {
                cb(e);
            }
        }
    };
};
