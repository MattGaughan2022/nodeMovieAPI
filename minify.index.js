const mongoose = require("mongoose");
const Models = require("./models.js");
const { check, validationResult } = require("express-validator");
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: !0,
  useUnifiedTopology: !0,
});
const bodyParser = require("body-parser");
const express = require("express"),
  morgan = require("morgan"),
  path = require("path");
fs = require("fs");
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: !0 }));
const cors = require("cors");
let allowedOrigins = ["http://localhost:8080", "http://testsite.com"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, !0);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), !1);
      }
      return callback(null, !0);
    },
  })
);
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");
app.use(morgan("common", { stream: accessLogStream }));
app.get("/", (req, res) => {
  res.send("Default text of my choosing!");
});
app.get("/secreturl", (req, res) => {
  res.send("This is a secret url with super top-secret content.");
});
app.get("/users", passport.authenticate("jwt", { session: !1 }), (req, res) => {
  Users.find()
    .select(["-Password"])
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: !1 }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .select(["-Password"])
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
app.get(
  "/movies",
  passport.authenticate("jwt", { session: !1 }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
app.get(
  "/movies/:movieTitle",
  passport.authenticate("jwt", { session: !1 }),
  (req, res) => {
    Movies.findOne({ Title: req.params.movieTitle })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
app.get(
  "/genres",
  passport.authenticate("jwt", { session: !1 }),
  (req, res) => {
    Genres.find()
      .then((genres) => {
        res.status(201).json(genres);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: !1 }),
  (req, res) => {
    Genres.findOne({ Name: req.params.name })
      .then((genres) => {
        res.status(201).json(genres);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
app.get(
  "/directors",
  passport.authenticate("jwt", { session: !1 }),
  (req, res) => {
    Directors.find()
      .then((director) => {
        res.status(201).json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: !1 }),
  (req, res) => {
    Directors.findOne({ Name: req.params.name })
      .then((director) => {
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: !1 }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username }).then((user) => {
      if (user) {
        Users.updateOne(
          { Username: req.params.Username },
          {
            $set: {
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
            },
          }
        )
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).send("Error: " + error);
          });
      } else {
        return res.status(400).send(req.params.Username + " does not exist");
      }
    });
  }
);
app.post("/user/lists/:name", (req, res) => {
  res.send(
    "Successful POST request for creating a new movie list (Not Yet Implemented)"
  );
});
app.put("/user/lists/:name", (req, res) => {
  res.send(
    "Successful PUT request for updating list info (add movie) (Not Yet Implemented)"
  );
});
app.delete("/user/lists/:name", (req, res) => {
  res.send(
    "Successful DELETE request for updating list info (remove movie) (Not Yet Implemented)"
  );
});
app.use("/", express.static("public"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke! (default loading error message...)");
});
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
