## Models & Connections
This module does not make any assumptions regarding your choice of datastore or how to interact with it. However, the need for some sort of ORM or db connection is fairly common, and so this module does provide hooks for integrating with other third party ORMs/ODMs like [mongoose](http://mongoosejs.com/) or [sequelize](http://docs.sequelizejs.com/en/latest/). These hooks use the premise of an `adapter` that is responsible for actually setting up a connection to the datastore (if required) and building `model` objects using the model definitions in your app. More on adapters later. First, let's take a look at the hooks themselves.


## Connections
Database connections can be defined in `/config/connections.js` file. Each connection configuration must specify an `adapter` which is responsible for building and returning a connection via the configuration. The `connections` hook will loop through the connections defined in the configuration file and hand them off to the appropriate adapter for construction.


*/config/connections.js*
```javascript
var mongooseAdapter = require('restify-microservice-mongoose'),
    sequelizeAdapter = require('restify-microservice-sequelize');

module.exports = {
    // define a name for you connection
    mongo: {
        // provide an adapter for the connection (required)
        adapter: mongooseAdapter,

        // the config object is passed to the adapter and should
        // provide all necessary info for establishing the
        // connection or configuring the adapter in general
        config: {
            host: process.env.MONGO_HOST || 'localhost',
            port: process.env.MONGO_PORT || 27017,
            user: process.env.MONGO_USERNAME,
            password: process.env.MONGO_PASSWORD,
            database: process.env.MONGO_DB
        },

        // define which models should use this connection
        include: [
            // make this the default connection, if no other
            // connection includes a model explicitly, this
            // connection's adapter will be used
            '*'
        ]
    },

    // define another connection
    mysql: {
        adapter: sequelizeAdapter,
        config: {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
        },
        include: [
            // include the `/app/models/permissions.js` model explicitly
            'permissions',
            // include all model definitions found in the
            // `/app/models/blog` folder
            'blog/*'
        ],
        exclude: [
            // do not include the `/app/models/blog/images.js` file
            // if not explicitly included in another connection
            // this file will use the default adapter
            'blog/images'
        ]
    }
};
```


## Models
The `models` hook is responsible for looping through all files found in the `/app/models` folder and subfolders and handing them off to the appropriate adapter for construction. Each model file should export a model definition that the adapter will use to build the model. Model definitions can and will vary based on the adapter being used. See adapter docs for configuration info.


*/app/models/users.js*
```javascript
var mongoose = require('mongoose'),
    phone = require('phone'),
    _ = require('lodash');

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
    },
    virtuals: {
        fullName: {
            get: function() {
                return _.capitalize(this.first) + ' ' + _.capitalize(this.last);
            }
        }
    }
};
```
[Back to home](/README.md)
