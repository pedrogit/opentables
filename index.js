const express = require('express');
const cookieParser = require('cookie-parser')
//const logger = require("morgan");
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const NodeUtil = require('util');

const Globals = require('./globals');
const Errors = require('./utils/errors');
const Utils = require('./utils/utils');

const listItemControler = require('./listItemControler');
const listItemRouter = require('./listItemRouter');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({extended: true}));
//app.use(logger('short'));
app.use(express.json());
app.use(cookieParser());

// Check for credentials sent via the Authorization header
// or as a token in the cookie
app.use(async (req, res, next) => {
  // default user to unauthenticated user
  req.user = Globals.unauthUserName;

  // check for credentiel in the authorization header
  if (req.headers.hasOwnProperty('authorization')) {
    var item = {};
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    var [email, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    email = email.toLowerCase();
    if (email === process.env.ADMIN_EMAIL) {
      if (password !== process.env.ADMIN_PASSWORD){
        next(new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.CouldNotLogin)));
      }
      Utils.setCookieJWT(req, res, {email: email});
    }
    else if (email !== '') {
      item = await listItemControler.simpleFind(Globals.userListId, {email: email});
      if (!item){
        next(new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.InvalidUser)));
      }
      if (!(bcrypt.compareSync(password, item.password))) {
        next(new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.CouldNotLogin)));
      }
      Utils.setCookieJWT(req, res, {email: email});
      req.user = email;
    }
  }

  // check in the cookie
  else if (req.cookies.authtoken) {
    try {
      jwt.verify(req.cookies.authtoken, process.env.TOKEN_SECRET, { algorithms: ['HS256'] });
      //resend the cookie
      res.cookie('authtoken', req.cookies.authtoken);
    }
    catch(err){
      next(new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.CouldNotLogin)));
    }
  }
  next();
});

// Make the server able to server filesystem files from the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Handle the REST listitem API
app.use('/api/' + Globals.listitemAPIKeyword, listItemRouter);

// Implement a generic error sending middleware
app.use((err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500;
  
  if (err.statusCode === 301) {
    return res.status(301).redirect('/not-found');
  }

  return res
    .status(err.statusCode)
    .json({err: err.message});
});


// Start the server
server = app.listen(PORT, () => {
  console.log('App started on port ' + PORT);
});

module.exports = server;

