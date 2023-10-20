const mongoose = require("mongoose");
const Models = require("./models.js");
const { check, validationResult } = require("express-validator");
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bodyParser = require("body-parser");

const express = require("express"),
  morgan = require("morgan"), //allows for non-fs logging
  path = require("path");
fs = require("fs");

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * approved API accessors
 * add resource accessing API below
 * @returns {boolean} bool response for approval or not
 */
const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://testsite.com",
  "https://mattg-moviesreact.netlify.app",
  "https://mattgaughan2022.github.io/myFlix-Angular-client/",
  "https://mattgaughan2022.github.io",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

app.use(morgan("common", { stream: accessLogStream }));

/**
 * default API endpoint
 * use this to initially test for API success with low-latency or payloads
 * @return {string} default text for a blank page
 */
app.get("/", (req, res) => {
  res.send("Default text of my choosing!");
});

/**
 * (NYI) receives list of users and their info
 * excludes (hashed) passwords
 * @returns user info (NYI)
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .select(["-Password"])
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * gets a user's info
 * this is not implemented in most sites currently
 * @returns {Object} of user info
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * receive all movie information
 * populates genre and director which are pointing to their
 *      own documents in MongoDB
 */
app.get("/movies", (req, res) => {
  Movies.find()
    .populate("Genre", "Name -_id")
    .populate("Director", "Name -_id")
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * find movie info based on given movie title or ID
 * @param {string} movieTitle in the url
 */
app.get(
  "/movies/:movieTitle",
  passport.authenticate("jwt", { session: false }),
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

/**
 * access all genres and their info
 * @return {array} of genres with sub items
 */
app.get(
  "/genres",
  passport.authenticate("jwt", { session: false }),
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

/**
 * access specific genre with given name
 * @param {string} name of genre
 */
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: false }),
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

/**
 * access all directors info
 * @return {array} of directors with sub items
 */
app.get(
  "/directors",
  passport.authenticate("jwt", { session: false }),
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

/**
 * access specific director with given name
 * @param {string} name of director
 */
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
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

/**
 * register new user
 * primarily keep the same checks here that are in the update
 *      user info (PUT) method below
 */
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

/**
 * updates user info in mongoDB cloud database
 * @param {string} Username of the user changing their info
 */
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    //can add an email check or more form validation her
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    function updateInfo() {
      let hashedPassword = Users.hashPassword(req.body.Password);

      Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          },
        },
        { returnOriginal: false }
      )
        .then((infoUpdated) => {
          return res.status(201).send(infoUpdated);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send("Error " + error);
        });
    }

    if (req.params.Username === req.user.Username) {
      Users.findOne({
        Username: req.body.Username,
      }).then((user1) => {
        if (
          user1 !== null &&
          req.body.Username === user1.Username &&
          req.params.Username !== req.user.Username &&
          req.body.Username !== null
        ) {
          return res
            .status(400)
            .send("Username '" + req.body.Username + "' is already taken");
        } else {
          Users.findOne({
            Username: req.params.Username,
          }).then((user) => {
            if (!user.validatePassword(req.body.OldPassword, user.Password)) {
              return res.status(401).send({ message: "Incorrect password." });
            }
            console.log("password validated while updating...");
            updateInfo();
          });
        }
      });
    } else {
      res.status(500).send("Unauthorized.");
    }
  }
);

/**
 * adding movieID to user's favoriteMovies list
 * @param {number} MovieID _id of the movie being added
 * @param {string} Username username of user adding movie to list
 */
app.post(
  "/users/:Username/list/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.params.Username === req.user.Username) {
      Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $push: { FavoriteMovies: req.params.MovieID } },
        { returnOriginal: false }
      )
        .then((success) => {
          console.log(success);
          return res.status(201).send({ success });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    } else {
      res.status(500).send("Unauthorized or fatal error.");
    }
  }
);
/**
 * remove movie from user favoriteMovie list
 * @param {string} Username of given user
 * @param {string} MovieID of desired movie to remove
 */
app.delete(
  "/users/:Username/list/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.params.Username === req.user.Username) {
      Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { returnOriginal: false }
      )
        .then((success) => {
          console.log(success);
          return res.status(201).send({ success });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    } else {
      res.status(500).send("Unauthorized or fatal error.");
    }
  }
);

/**
 * delete user with given username
 * @param {string} :Username - username of the user deleting their account
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.params.Username === req.user.Username) {
      Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
          if (!user) {
            res.status(400).send(req.params.Username + " was not found");
          } else {
            res.status(200).send(req.params.Username + " was deleted.");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    } else {
      res.status(500).send("Unauthorized or fatal error.");
    }
  }
);

app.use("/", express.static("public")); //allow access to multiple files like documentation

app.use((err, req, res, next) => {
  //error handling
  console.error(err.stack);
  res.status(500).send("Something broke! (default API error message...)");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
