'use strict';

module.exports = function bodyParser(microservice) {
    return microservice._restify.bodyParser();
};
