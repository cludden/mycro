# hooks/services.js
The `services` hook will recursively load all services in `app/services/` and make them
available at `microservice.services[<path to service>]`. If the service exports a function, this hook assumes that the function is the service constructor and will automatically build a new service using the constructor. If the constructor expects a single argument, the `microservice` object will be passed as the sole argument to the constructor.

### examples
a simple object service
```javascript
// in app/services/numeral.js

var numeral = require('numeral');

module.exports = {
    /**
     * Expose numeral.js as a service
     * @param  {Number} value  - the value to format
     * @param  {String} format - the format string
     * @return {String}
     */
    format: function(value, format) {
        return numeral(value).format(format);
    }
};
```

a constructor service that expects a single argument
```javascript
// in app/services/auth/users.js

// export a constructor that expects the microservice object, which allow us to
// use other services within this service
module.exports = function(microservice) {

    // return a service object
    return {
        /**
         * Query a single user from dynamoDB using a dynamoDB service
         * @param  {Number}   id - the user's id
         * @param  {Function} cb - callback
         */
        getUser: function(id, cb) {
            microservice.services['dynamoDB'].get({

            }, function(err, user) {
                if (err) {
                    microservice.log('error', err);
                    return cb(err);
                }
                cb(null, user);
            });
        }
    };
}
```

using the services in a controller
```javascript
// in app/controllers/user.js

module.exports = {
    /**
     * Find a single user and format their account balance for display
     * @param  {Requeest} req
     * @param  {Response} res
     */
    findOne: function(req, res) {
        var UserService = req.microservice.services['auth/users'],
            NumeralService = req.microservice.services['numeral'];

        UserService.getUser(req.params.id, function(err, user) {
            if (err) {
                return res.json(500, {error: err});
            }
            var balance -
            user.accountBalance = NumeralService.format(user.accountBalance, '+0,0.00');
            res.json(200, {user: user});
        });
    }
}
```
