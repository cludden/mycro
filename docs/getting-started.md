## Getting Started
Check out the test-apps in the `/test` folder for some examples, or read the docs.


*/index.js*
```javascript
var Mycro = require('mycro'),
    mycro = new Mycro();

mycro.start(function(err) {
    if (err) {
        return mycro.log('error', err);
    }
    mycro.log('info', 'mycro started successfully');
});
```


## Project Structure
A typical `mycro` project structure:
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
