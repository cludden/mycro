'use strict';

var restify = require('restify'),
    async = require('async');

var Microbial = function(config) {
    var self = this;
    self._config = config || {};
    self._version = require('./package.json').version;
    self._ready = false;
    ['connections', 'controllers', 'models', 'policies', 'services', 'routes'].forEach(function(container) {
        self[container] = {};
    });
};

Microbial.prototype.getConfig = require('./lib/config');

Microbial.prototype.registerConnections = require('./lib/connections');

Microbial.prototype.registerModels = require('./lib/models');

Microbial.prototype.start = require('./lib/start');

module.exports = Microbial;