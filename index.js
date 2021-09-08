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

// Check for credentials sent via registration,
// in the Authorization header
// or in  token in the cookie
app.use(async (req, res, next) => {
  if (req.headers.hasOwnProperty('authorization')) {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [email, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    const item = await listItemControler.simpleFind(Globals.userListId, {email: email.toLowerCase()});
    if (!item){
      next(new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.InvalidUser)));
    }
    if (!(bcrypt.compareSync(password, item.password))) {
      next(new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.CouldNotLogin)));
    }
    //res.cookie('authtoken', jwt.sign({ email: item.email }, process.env.TOKEN_SECRET), { httpOnly: true });
    Utils.setCookieJWT(res, {email: item.email});
  }
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
app.use('/api/listitem', listItemRouter);

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

/*module.exports = {
  server: server,
  listItemControler: listItemControler
};*/

//console.log('asa');
