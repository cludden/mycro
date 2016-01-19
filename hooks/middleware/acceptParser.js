'use strict';

module.exports = function acceptParser(mycro) {
    return mycro._restify.acceptParser(mycro.server.acceptable);
};
