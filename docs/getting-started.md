## Getting Started
Check out the test-apps in the `/test` folder for some examples, or read the docs.


*/index.js*
```javascript
var Microservice = require('restify-microservice'),
    microservice = new Microservice();

microservice.start(function(err) {
    if (err) {
        return microservice.log('error', err);
    }
    microservice.log('info', 'microservice started successfully');
});
```


## Project Structure
A typical `restify-microservice` project structure:
- **/my-project**
    - **/app**
      - **/controllers**
      - **/models**
      - **/policies**
      - **/routes**
      - **/services**
      - routes.js
    - **/config**
    - **/hooks**
    - index.js


[Back to home](/README.md)
