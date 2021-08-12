const express = require('express');
//const logger = require("morgan");

const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({extended: true}));
//app.use(logger('short'));
app.use(express.json());

// Make the server able to server filesystem files from the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Handle the REST listitem API
app.use('/api/listitem', require('./listItem/listItemRouter'));

// Implement a generic error sending middleware
app.use((err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500;
  
  if (err.statusCode === 301) {
    return res.status(301).redirect('/not-found');
  }

  return res
    .status(err.statusCode)
    .json({err: err.toString()});
});


// Start the server
server = app.listen(PORT, () => {
  console.log('App started on port ' + PORT);
});

module.exports = server;