'use strict';

const async = require('async');
const _ = require('lodash');

module.exports = function start(done) {
    const mycro = this;

    // make sure that `mycro.server` exists and resembles an express or restify server
    if (!mycro.server || !mycro.server.listen || !_.isFunction(mycro.server.listen)) {
        mycro.log('silly', 'There doesn\'t appear to be a server to start');
        return async.setImmediate(done);
    }

    const port = mycro._config.server.port || process.env.PORT;
    if (isNaN(port)) {
        mycro.log('info', 'port is not a number', port);
    }

    mycro.log('silly', 'starting server on port', port);
    mycro.server.listen(port, function(err) {
        if (err) {
            mycro.log('error', 'there was an erro starting the server', err);
            return async.setImmediate(function() {
                done(err);
            });
        }
        mycro.log('info', 'server listening on port', port);
        return async.setImmediate(done);
    });
};
