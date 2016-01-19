'use strict';

module.exports = {
    middleware: [
        function acceptParser(mycro) {
            return mycro._restify.acceptParser(mycro.server.acceptable);
        },
        function dateParser(mycro) {
            return mycro._restify.dateParser();
        },
        function queryParser(mycro) {
            return mycro._restify.queryParser();
        },
        function bodyParser(mycro) {
            return mycro._restify.bodyParser();
        },
        function morgan() {
            return require('morgan')('dev');
        },
        'request',
        'request-all-params'
    ]
};
