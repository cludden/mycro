'use strict';

module.exports = function(mycro) {
    return {
        /**
         * Find a specific user
         * @param  {Object} req
         * @param  {Object} req.params
         * @param  {String} req.params.user_id
         * @param  {Object} res
         */
        index(req, res) {
            const Err = mycro.services.error;
            const Serialize = mycro.services.serialize;
            const Users = mycro.services.user;

            Users.findById(req.params.user_id)
            .then(Serialize.serialize('user'))
            .then(function(payload) {
                res.status(200).send(payload);
            })
            .catch(Err.sendResponse(res));
        }
    };
};
