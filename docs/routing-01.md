## Routing (Part I)
`mycro`'s default routing hook provides a flexible and powerful routing mechanism for `restify` apps. The main routing configuration is defined in `/app/routes.js`. An extremely simple routing configuration can be seen below.


*/app/routes.js*
```javascript
module.exports = function(mycro) {
    return {
        '/greet': {
            get: 'greet.sayHello'
        },
        '/blog': {
            '/comments': {
                get: 'blog/comments.find'
                post: 'blog/comments.create',
                '/:id': {
                    del: 'blog/comments.destroy',
                    get: 'blog/comments.findOne',
                    put: 'blog/comments.update'
                }
            },
            '/posts': {
                get: 'blog/posts.find'
                post: 'blog/posts.create',
                '/:id': {
                    del: 'blog/posts.destroy',
                    get: 'blog/posts.findOne',
                    put: 'blog/posts.update'
                }
            }
        }
    };
};
```
The routing configuration shown above defines the following routes
- `GET /greet` => handled by the *sayHello* method on the *greet* controller
- `GET /blog/comments` => handled by the *find* method on the *blog/comments* controller
- `POST /blog/comments` => handled by the *create* method on the *blog/comments* controller
- `DELETE /blog/comments/:id` => handled by the *destroy* method on the *blog/comments* controller
- `GET /blog/comments/:id` => handled by the *findOne* method on the *blog/comments* controller
- `PUT /blog/comments/:id` => handled by the *update* method on the *blog/comments* controller
- `GET /blog/posts` => handled by the *find* method on the *blog/posts* controller
- `POST /blog/posts` => handled by the *create* method on the *blog/posts* controller
- `DELETE /blog/posts/:id` => handled by the *destroy* method on the *blog/posts* controller  
- `GET /blog/posts/:id` => handled by the *findOne* method on the *blog/posts* controller
- `PUT /blog/posts/:id` => handled by the *update* method on the *blog/posts* controller  

The default routing hook also allows you to include external route configurations and mount them at a given path, which allows you to separate your route configuration into multiple smaller configurations.  

For example, you could create an `/app/routes/admin.js` file to hold all of your admin related endpoint configurations:

*/app/routes/admin.js*
```javascript
module.exports = {
    '/groups': {
        // ...
    }
    '/permissions': {
        // ...
    },
    '/users': {
        // ...
    }
};
```

and then mount it at `/admin` like so:

*/app/routes.js*
```javascript
module.exports = function(mycro) {
    return {
        '/admin': 'admin' // inline definition

        // or, if you want to specify some default options/policies for the
        // entire /admin/* path
        '/admin': {
            policies: [ /* ... */ ],
            routes: 'admin'
        }
    };
};
```

Route inclusion also allows you to reuse routes in a manner similar to sails blueprints. For example, instead of redefining the common [crud](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) functionality in two separate controllers, and then defining two sets of crud endpoints that really only differ in the `model` they point to, we could instead define a single crud controller and a single crud route configuration and mount it at various endpoints.


A very simple crud controller outline, that looks for a model to use in the *Request* options.

*/app/controllers/crud.js*
```javascript
module.exports = {
    create: function(req, res) { /* ... */ },
    destroy: function(req, res) { /* ... */ },
    find: function(req, res) {
        var modelName = req.options.model,
            Model = req.mycro.models[modelName];
        if(!Model) return res.json(400, {error: 'Invalid model specified: ' + modelName});

        var criteria = req.mycro.services['crud'].parseCriteriaFromRequest(req);
        Model.find(criteria, function(err, results) {
            if (err) return res.json(500, {error: err});
            res.json(200, {data: results});
        });
    },
    findOne: function(req, res) { /* ... */ },
    update: function(req, res) { /* ... */ },
};
```

Now define a reusable route configuration:

*/app/routes/crud.js*
```javascript
module.exports = {
    get: 'crud.find'
    post: 'crud.create',
    '/:id': {
        del: 'crud.destroy',
        get: 'crud.findOne',
        put: 'crud.update'
    }
};
```

Lastly, we can now mount the `CRUD` routes at various endpoints throughout our app.


*/app/routes.js*
```javascript
module.exports = function(mycro) {
    return {
        '/admin': 'admin',
        '/blog': {
            '/comments': {
                options: {
                    model: 'blog/comments'
                },
                routes: 'crud'
            },
            '/posts': {
                options: {
                    model: 'blog/posts'
                },
                routes: 'crud'
            }
        }
    };
};
```
*/app/routes/admin.js*
```javascript
module.exports = {
    '/groups': {
        options: {
            model: 'groups'
        },
        routes: 'crud'
    }
    '/permissions': {
        options: {
            model: 'permissions'
        },
        routes: 'crud'
    },
    '/users': {
        options: {
            model: 'users'
        },
        routes: 'crud'
    }
};
```
[Back to home](/README.md)
