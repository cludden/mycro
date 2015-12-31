'use strict';

module.exports = function queryParser(microservice) {
    return microservice._restify.queryParser();
};
