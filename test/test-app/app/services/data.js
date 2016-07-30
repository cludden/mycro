'use strict';

const Baobab = require('baobab');
const include = require('include-all');
const _ = require('lodash');

module.exports = function() {
    const models = include({
        dirname:  __dirname + '/../fixtures',
        filter:  /(.+)\.js$/,
        excludeDirs:  /^\.(git|svn)$/,
        keepDirectoryPath: true,
        flattenDirectories: true,
        optional:  true
    });

    const db = new Baobab(models);

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
                const record = db.select(model, {id: id}).get();
                return cb(null, record);
            } catch (e) {
                cb(e);
            }
        },

        find: function(model, criteria, cb) {
            try {
                let records = db.select(model).get();
                records = _.filter(records, criteria);
                return cb(null, records);
            } catch (e) {
                cb(e);
            }
        },

        remove: function(model, id, cb) {
            try {
                const i = _.findIndex(db.select(model).get(), {id: id});
                if (i === -1) {
                    return cb();
                }
                const removed = db.select(model).splice([i, 1]);
                return cb(null, removed);
            } catch (e) {
                cb(e);
            }
        },

        update: function(model, id, values, cb) {
            try {
                const i = _.findIndex(db.select(model).get(), {id: id});
                if (i === -1) {
                    return cb();
                }
                const instance = db.select(model, i).get();
                const updated = _.extend(_.clone(instance), values);
                db.set([model, i], updated);
                return cb(null, updated);
            } catch (e) {
                cb(e);
            }
        }
    };
};
