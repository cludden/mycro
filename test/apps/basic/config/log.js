'use strict';

const winston = require('winston');

module.exports = {
    logger: function Logger(options) {
        const logger = new winston.Logger(options);
        return {
            foo: 'bar',
            log(...args) {
                logger.log.apply(logger, args);
            }
        };
    }
};
