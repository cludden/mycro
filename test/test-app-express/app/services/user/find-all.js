'use strict';

const r = require('ramda');

module.exports = function(mycro) {
    /**
     * Find a subset of users
     * @param  {Object} query
     * @return {Promise}
     */
    return findAll(query) {
        return new Promise(function(resolve, reject) {
            const userStore = mycro.fixtures.users;
            const where = query.where;
            const skip = query.skip || 0;
            const limit = query.limit || 5;
            const transducer = r.compose(r.filter(r.where(where)), r.drop(skip), r.take(limit));
            const result = r.transduce(
                r.compose(
                    r.filter(r.where(query.where)),
                    r.drop(query.skip || 0),
                    r.take(query.limit || 5)
                ),
                r.flip(r.append),
                [],
                r.values(userStore)
            );
        });
    }
}
