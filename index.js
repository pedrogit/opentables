const express = require('express');
//const logger = require("morgan");
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost/listitdata', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false } );
mongoose.Promise = global.Promise;

app.use(express.urlencoded({extended: true}));
//app.use(logger('short'));
app.use(express.json());

// Make the server able to server filesystem files from the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Handle the REST listitem API
app.use('/api/listitem', require('./listitemrouter'));

// Handle the REST list API
app.use('/api/list', require('./listrouter'));

// Implement a generic error sending middleware
app.use((error, req, res, next) => {
  if (!error.statusCode) error.statusCode = 500;
  
  if (error.statusCode === 301) {
    return res.status(301).redirect('/not-found');
  }

  return res
    .status(error.statusCode)
    .json({ error: error.toString() });
});

// Start the server
server = app.listen(PORT, () => {
  console.log('App started on port ' + PORT);
});

module.exports = server;