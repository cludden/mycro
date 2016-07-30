'use strict';

module.exports = function(mycro) {
    /**
     * Find a specific user by id
     * @param  {String} uid
     * @return {Promise}
     */
    return function findById(uid) {
        const userStore= mycro.fixtures.users;
        return new Promise(function(resolve, reject) {
            process.nextTick(function() {
                const user = userStore[uid];
                if (!user) {
                    const err = new Error('Unable to locate user with id: ' + uid);
                    mycro.log('error', err);
                    return reject(err);
                }
                resolve(user);
            });
        });
    };
};
