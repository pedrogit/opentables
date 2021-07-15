const express = require('express');
const listRouter = express.Router();
const listModel = require('./listmodel');

const Errors = require('./errors');

const staticLists = [
  {
     'ownerid': 'pierre',
     'rperm': '@all',
     'wperm': '@owner'
  },
  {  
     'ownerid': 'pierre',
     'rperm': '@all',
     'wperm': '@owner'
  },
  {
     'ownerid': 'nat',
     'rperm': '@all',
     'wperm': '@owner'
  }
];

listRouter.get('', function(req, res, next){
  listModel.find({})
           .then(function(lists){
                   res.send(lists);
                 }).catch(next);
});

listRouter.get('/:ownerid', function(req, res, next) {
  listModel.findById(req.params.ownerid)
           .then(function(list){
                   if (!list) {
                        next(new Errors.NotFound('No such list (' + res.req.params.ownerid + ')...'));
                   }
                   else {
                     res.send(list);
                   };
                 }).catch(next);
});

listRouter.post('', function(req, res, next){
  console.log(req.body);
  listModel.create(req.body)
           .then(function(list){
                   if (! (list instanceof Array))
                   {
                     list = JSON.parse('[' + JSON.stringify(list) + ']');
                   }
                     
                   res.status(201)
                      .send(list);
                 }).catch(next);
});

listRouter.delete('', function(req, res, next){
  listModel.deleteMany({})
           .then(function(lists){
                   // if DELETE fails return 500
                   if (lists.ok != 1)
                     next();

                   res.send({'deletedCount': lists.deletedCount});
                 }).catch(next);
});

module.exports = listRouter;

/* Lists API

  GET /api/lists             // Get all lists
  GET /api/lists/:ownerid    // Get lists owned by a specific user
  GET /api/list/:listid      // Get by id (might not be necessary since id can be passed as a parameter to GET /api/lists/:ownerid)

  POST /api/lists            // post a new list

  PUT /api/lists/:listid     // replace a list by id

  PATCH /api/lists/:listid   // patch a list by id

  DELETE /api/lists/:listid  // delete a list by id

  Response status codes

  - 400 Bad Request – client sent an invalid request, such as lacking required request body or parameter
  - 401 Unauthorized – client failed to authenticate with the server
  - 403 Forbidden – client authenticated but does not have permission to access the requested resource
  - 404 Not Found – the requested resource does not exist
  - 412 Precondition Failed – one or more conditions in the request header fields evaluated to false
  - 422 Unprocessable Entity - Well formed but unprocessable request (not used)
  - 500 Internal Server Error – a generic error occurred on the server
  - 503 Service Unavailable – the requested service is not available

*/

/* Different ways to handle errors:

// Errors are of different types:

1) Invalid id for GET :id or DELETE :id
2) Missing Restfull data in POST or PATCH
2) Invalid json data

// Method A) Using an app global handler (from https://towardsdatascience.com/build-a-rest-api-with-node-express-and-mongodb-937ff95f23a5)

// in the router
Student.find({}).then(function(students){
    res.send(students);
}).catch(next);

// in the application
app.use(function(err, req, res, next){
    res.status(422).send({error: err.message});
 });


// Method B) Invoquing the default Express error handler (from MERN Quick Start Guide)

app.get('/', (request, response, next) => {
  try {
    throw new Error('Oh no!, something went wrong!')
  } catch (error) {
    next(error)
  }
})

// or a custom one
app.use((error, request, response, next) => {
  response.end(error.message)
})

// Method C) 

 */


