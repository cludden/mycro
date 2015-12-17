'use strict';

module.exports = {
    version: '1.0.0',
    middleware: [
        function acceptParser(microservice) {
            return microservice._restify.acceptParser(microservice.server.acceptable);
        },
        function dateParser(microservice) {
            return microservice._restify.dateParser();
        },
        function queryParser(microservice) {
            return microservice._restify.queryParser();
        },
        function bodyParser(microservice) {
            return microservice._restify.bodyParser();
        },
        'request',
        'request-all-params'
    ]
};
