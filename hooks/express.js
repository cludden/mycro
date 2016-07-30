'use strict';

const async = require('async');
const express = require('express');
const _ = require('lodash');

module.exports = function server(done) {
    const mycro = this;

    // store a reference to this restify
    mycro._express = express;

    // locate user defined server config and create server

    const app = express();
    mycro.server = app;

    let configure = _.get(mycro, '_config.server.configure');
    if (!_.isFunction(configure)) {
        return async.setImmediate(done);
    }

    if (configure.length === 1) {
        configure(app);
        return async.setImmediate(done);
    }

    return configure(app, done);
};
