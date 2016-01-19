## Services
Services hold logic that is used and reused throughout your application. They can be defined as a plain old javascript object or as a function that accepts the `mycro` instance, which allows you to utilize services within one another.


*/app/services/email.js*
```javascript
var AWS = require('aws-sdk'),
    ses = new AWS.SES({
        region: 'us-west-2'
    });

module.exports = {
    sendEmail: function(options, cb) {
        ses.sendEmail(options, cb);
    }
};
```
*/app/services/error.js*
```javascript
var bugsnag = require('bugsnag');
bugsnag.register(process.env['BUGSNAG_API_KEY']);

module.exports = function(mycro) {
    return {
        notify: function(err) {
            mycro.log('error', err);
            mycro.services['email'].sendEmail({}, function() {});
            bugsnag.notify(err);
        }
    };
};
```  

Additionally, services can be grouped into sub-folders within the `/app/services` folder for organization. These nested services can be accessed via their full path (ie `mycro.services['format/number']`)


*/app/services/format/number.js*
```javascript
var numeral = require('numeral');

module.exports = {
    accounting: function(number) {
        return numeral(number).format('(0,0.00) $');
    },
    currency: function(number) {
        return numeral(number).format('$0,0.00');
    }
};
```
*/app/services/format/date.js*
```javascript
var moment = require('moment');

module.exports = {
    friendly: function(date) {
        return moment(date).format('DDDDD');
    },
    standard: function(number) {
        return nmoment(date).format('MM/DD/YYYY');
    }
};
```
[Back to home](/README.md)
