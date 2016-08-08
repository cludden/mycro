'use strict';

import winston from 'winston';


export default {
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
