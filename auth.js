const jwtSecret =
  "f4b9ab29802618cd13aeb31bc3c5c7dd0b8c265f0831c9403606336334428723";

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport.js");

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

// login
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error) {
        console.log(error);
        return res.status(400).json({
          message: "Something is not working.",
          user: user,
        });
      } else if (!user) {
        console.log(error);
        return res.status(400).json({
          message: "Username not found.",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
