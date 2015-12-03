'use strict';

var restify = require('restify'),
    _ = require('lodash'),
    async = require('async');

var Microservice = function(config) {
    this._config = config || {};
    this._version = require('./package.json').version;
    this._ready = false;
    ['connections', 'controllers', 'models', 'policies', 'services', 'routes'].forEach(function(container) {
        this[container] = {};
    }.bind(this));
    require('./lib/init').call(this);
};

module.exports = Microservice;
