[Back to home](/README.md)
## Getting Started
The easiest way to get started is to use [http://yeoman.io/] to generate a new `mycro` project.
```javascript
// first, make sure you have yeoman and the mycro generator installed globablly
npm install -g yo generator-mycro

// then, create a new project
yo mycro my-new-project

// lastly, switch into your new project directory and start the app or run the tests
cd my-new-project
npm test
npm start
```

Also, feel free to check out the test-apps in the `/test` folder for some examples, or read the docs.


To start a project from scratch, install mycro via `npm install --save mycro` and create an entry point.


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
