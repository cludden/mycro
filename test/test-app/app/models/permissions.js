'use strict';

module.exports = function(connection) {
    return connection.define('permissions', {
        name: String,
        resource: String,
        groups: [Number]
    });
};
