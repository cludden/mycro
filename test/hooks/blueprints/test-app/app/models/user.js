var Joi = require('joi');

module.exports = {

    schema: {
        first: Joi.string(),
        last: Joi.string()
    }

};