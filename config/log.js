'use strict';

var winston = require('winston');

module.exports = {
    level: 'silly',
    transports: [
        new (winston.transports.Console)({
            colorize: true
        })
    ],
    colors: {
        error: 'red',
        warn: 'orange',
        info: 'magenta',
        verbose: 'green',
        debug: 'blue',
        silly: 'cyan'
    }
};
