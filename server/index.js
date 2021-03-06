const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const NodeUtil = require("util");

const Globals = require("../common/globals");
const Errors = require("../common/errors");
const Utils = require("./src/serverUtils");

const controler = require("./src/controler");
const router = require("./src/router");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: true,
    // preflightContinue: true, // allow HTTP methods other than GET, HEAD and POST (e.g. PATCH and DELETE)
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Check for credentials sent via the Authorization header
// or as a token in the cookie
app.use(async (req, res, next) => {
  // default user to unauthenticated user
  req.user = Globals.allUserName;

  // check for credentiel in the authorization header
  if (Object.prototype.hasOwnProperty.call(req.headers, "authorization")) {
    let item = {};
    const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
    const [email, password] = Buffer.from(b64auth, "base64")
      .toString()
      .split(":");
    const lcEmail = email.toLowerCase();

    if (lcEmail !== "") {
      if (password === "") {
        return next(
          new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.CouldNotLogin))
        );
      }

      if (lcEmail === process.env.ADMIN_EMAIL) {
        if (password !== process.env.ADMIN_PASSWORD) {
          return next(
            new Errors.Unauthorized(
              NodeUtil.format(Errors.ErrMsg.CouldNotLogin)
            )
          );
        }
        req.user = Globals.adminUserName;
      } else {
        item = await controler.simpleFind(Globals.userListId, {
          [Globals.emailFieldName]: lcEmail,
        });

        if (!item) {
          return next(
            new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.InvalidUser))
          );
        }
        if (!item.password || !bcrypt.compareSync(password, item.password)) {
          return next(
            new Errors.Unauthorized(
              NodeUtil.format(Errors.ErrMsg.CouldNotLogin)
            )
          );
        }
        req.user = item[Globals.usernameFieldName];
      }

      Utils.setCookieJWT(req, res, { username: req.user });
    }
  }

  // check in the cookie
  else if (req.cookies.authtoken) {
    try {
      jwt.verify(req.cookies.authtoken, process.env.AUTH_SECRET_TOKEN, {
        algorithms: ["HS256"],
      });
      // resend the cookie
      res.cookie("authtoken", req.cookies.authtoken);
    } catch (err) {
      return next(
        new Errors.Unauthorized(NodeUtil.format(Errors.ErrMsg.CouldNotLogin))
      );
    }
    req.user = jwt.decode(req.cookies.authtoken).username;
  }
  return next();
});

// Make the server able to server filesystem files from the public folder
// app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, "../public")));

// Handle the REST API
app.use(`/api/${Globals.APIKeyword}`, router);

// Implement a generic error sending middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.statusCode === 301) {
    return res.status(301).redirect("/not-found");
  }

  return res.status(err.statusCode || 500).json({ err: err.message });
});

// Start the BD and then the server
controler.init(() => {
  app.listen(PORT, () => {
    console.log(
      `Server started on port ${PORT} in ${
        process.env.NODE_ENV || "production"
      } mode...`
    );
    app.emit("started");
  });
});

module.exports = app;
