require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.setCookieJWT = function (req, res, payload) {
    var jwtoken = jwt.sign(payload, process.env.AUTH_SECRET_TOKEN, {
      algorithm: "HS256",
    });
    res.cookie("authtoken", jwtoken, { httpOnly: false });
    req.user = payload.username;
  };

