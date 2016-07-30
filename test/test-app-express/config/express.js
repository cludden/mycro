'use strict';

const async = require('async');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');

module.exports = function(app, done) {
    // define app environment
    const env = process.env.NODE_ENV || 'development';
    app.set('env', env);
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env === 'development';

    app.set('port', process.env.PORT || 8080);
    app.set('x-powered-by', false);

    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(compress());
    app.use(methodOverride());

    async.setImmediate(done);
};
