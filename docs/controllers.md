## Controllers
Controllers hold all of your endpoint-specific logic and behave in a manner very similar to `sails.js`. All controllers live in the `/app/controllers` folder.  

A very simple controller:  


*/app/controllers/greet.js*
```javascript
module.exports = {
    sayHello: function(req, res) {
        res.json(200, {message: 'Hello World!'});
    }
};
```

Controllers can also be grouped in sub-folders within the `/app/controllers` folders, and are able to access models and services by referencing the appropriate containers on the microservice instance, which is available in all controller methods via the *Request* object (`req.microservice`)


*/app/controllers/blog/posts.js*
```javascript
module.exports = {
    create: function(req, res) {
        var microservice = req.microservice;
        async.auto({
            post: function createPost(next) {
                microservice.models['blog/posts'].create(req.body, next);
            },

            notify: ['post', function notifyAuthor(next, results) {
                microservice.services['email'].sendEmail({
                    to: results.post.author.email
                }, next);
            }]
        }, function(err, results) {
            if (err) {
                return res.json(500, {error: err});
            }
            res.json(200, {data: results.post});
        });
    },

    destroy: function(req, res) { /* destroy logic */ }
};
```
*/app/controllers/blog/comments.js*
```javascript
module.exports = {
    create: function(req, res) { /* create login */ },
    destroy: function(req, res) { /* destroy logic */ }
};
```
[Back to home](/README.md)
