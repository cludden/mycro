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
        trace: 'magenta',
        input: 'grey',
        verbose: 'cyan',
        prompt: 'grey',
        debug: 'blue',
        info: 'green',
        data: 'grey',
        help: 'cyan',
        warn: 'yellow',
        error: 'red'
    }
};
