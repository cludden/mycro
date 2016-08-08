'use strict';

import winston from 'winston';


export default {
    logger: winston.Logger,
    options: {
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
    }
};
