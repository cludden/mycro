## Models & Connections
This module does not make any assumptions regarding your choice of datastore or how to interact with it. However, the need for some sort of ORM or db connection is fairly common, and so this module does provide hooks for integrating with other third party ORMs/ODMs like [mongoose](http://mongoosejs.com/) or [sequelize](http://docs.sequelizejs.com/en/latest/). These behavior of these hooks is outlined below.


## Connections
Database connections can be defined in `/config/connections.js` file. Each connection configuration must specify an `adapter` which is responsible for building and returning a connection via the configuration. The `connections` hook will loop through the connections defined in the configuration file and hand them off to the appropriate adapter for construction.


*/config/connections.js*
```javascript
var mongooseAdapter = require('restify-microservice-mongoose');

module.exports = {
    mongo: {
        adapter: mongooseAdapter,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 27017,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
};
```


## Models
Model definitions can be defined in the `/app/models` folder. Each configuration should specify the connection to use, or you should specify a default connection in the `/config/models.js` file. Model configurations can and will vary based on the adapter being used. See adapter docs for configuration info.

The `models` hook is responsible for looping through all configuration files found in the `/app/models` folder and subfolders and handing them off to the connection's adapter for construction.


*/config/models.js*
```javascript
module.exports = {
    // define a default connection to use
    connection: 'mongo'
};
```
*/app/models/users.js*
```javascript
var mongoose = require('mongoose'),
    phone = require('phone');

module.exports = {
    schemaOptions: {
        collection: 'users'
    },
    schema: {
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        hash: {
            type: String
        },
        phones: {
            mobile: {
                type: String,
                required: true,
                validate: function(value, cb) {
                    var result = phone(value);
                    if (!result.length) return cb(false, value + ' is not a valid phone number');
                    cb(true);
                }
            },
            office: {
                type: String,
                validate: function(value, cb) {
                    var result = phone(value);
                    if (!result.length) return cb(false, value + ' is not a valid phone number');
                    cb(true);
                }
            }
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organizations'
        },
        groups: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'groups'
        }]
    }
};
```
[Back to home](/README.md)
