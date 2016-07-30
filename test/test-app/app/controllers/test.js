'use strict';

module.exports = {
    /**
     * Return body params wrapped inside `params` attribute
     *
     * @param  {Request} req
     * @param  {Response} res
     */
    bodyParser: function(req, res) {
        res.json(200, {params: req.body});
    },


    /**
     * Return query params as body
     *
     * @param  {Request} req
     * @param  {Response} res
     */
    queryParser: function(req, res) {
        res.json(200, {query: req.query});
    }
};
