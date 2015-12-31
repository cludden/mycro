'use strict';

module.exports = function acceptParser(microservice) {
    return microservice._restify.acceptParser(microservice.server.acceptable);
};
