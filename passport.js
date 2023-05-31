const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    (username, password, asyncFunc) => {
      console.log(username + " " + password);
      Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            console.log("Username not found.");
            return document(null, false, { message: "Username was not found" });
          }

          return asyncFunc(null, user);
        })
        .catch((error) => {
          console.log("Something went wrong");
          return asyncFunc("Error: " + error).status(400);
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        "f4b9ab29802618cd13aeb31bc3c5c7dd0b8c265f0831c9403606336334428723",
    },
    (jwtPayload, asyncFunc2) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return asyncFunc2(null, user);
        })
        .catch((error) => {
          return asyncFunc2(error);
        });
    }
  )
);
