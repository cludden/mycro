'use strict';

module.exports = {
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
        function morgan() {
            return require('morgan')('dev');
        },
        'request',
        'request-all-params'
    ]
};
