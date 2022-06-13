require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.setCookieJWT = (req, res, payload) => {
  const jwtoken = jwt.sign(payload, process.env.AUTH_SECRET_TOKEN, {
    algorithm: "HS256",
  });
  res.cookie("authtoken", jwtoken, {
    httpOnly: false,
    sameSite: "None",
    secure: true,
  });
  req.user = payload.username;
};
