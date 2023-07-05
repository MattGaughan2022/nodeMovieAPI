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

const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://testsite.com",
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

app.get("/", (req, res) => {
  res.send("Default text of my choosing!");
});

app.get("/secreturl", (req, res) => {
  res.send("This is a secret url with super top-secret content.");
});

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
  //register copypasta
  "/users/:Username",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  // alert("Current password must be entered to make changes.")
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    function updateInfo(){
    let hashedPassword = Users.hashPassword(req.body.Password);
      
      Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          }
        }
      ).then(
        (infoUpdated) => {
        res.status(200).send(infoUpdated)
      }).catch(
        (error)=>{
        console.log(error)
        res.status(500).send("Error " + error)
      });
    }

    if(req.params.Username === req.user.Username){
      if(req.body.Username !== req.user.Username){
        Users.findOne({
          Username: req.body.Username
        }).then(user=>{
          if(user){
            return res.status(400).send("Username '" + req.body.Username + "' is already taken")
          } else{
            updateInfo();
          }
        });
      }
      else{
        updateInfo();
      }
    }
    else{
      res.status(500).send("Unauthorized.");
    }
    
  }
);
//for implementing multiple lists and creation of (i.e. 'watchlist' vs 'favorites')
// app.get(
//   "/users/:Username/lists/:ListName",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     Users.findOne({ Name: req.params.Username })
//       .then((favoriteMovies) => {
//         res.status(201).json(favoriteMovies);
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send("Error: " + err);
//       });
//   }
// );

app.post("/users/:Username/list/:MovieID",
passport.authenticate("jwt", { session: false }),
(req, res) => {
  if(req.params.Username === req.user.Username){
  Users.findOneAndUpdate({ Username: req.params.Username },{
    $push:{FavoriteMovies: req.params.MovieID}})
    .then((success) => {
      console.log(success + req.params.Username + req.params.MovieID);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  }
  else{
    res.status(500).send("Unauthorized.");
  }
}

);

app.delete("/users/:Username/list/:MovieID",
passport.authenticate("jwt", { session: false }),
(req, res) => {
  if(req.params.Username === req.user.Username){
  Users.findOneAndUpdate({ Username: req.params.Username },{
    $pull:{FavoriteMovies: req.params.movieID}})
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  }
  else{
    res.status(500).send("Unauthorized.");
  }
}
);

app.put("/users/:Username/lists/:ListName/:MovieID", (req, res) => {
  res.send(
    "Successful PUT request for updating list info (add movie) (Not Yet Implemented)"
  );
});
app.delete("/users/:Username/lists/:ListName/:MovieID", (req, res) => {
  res.send(
    "Successful DELETE request for updating list info (remove movie) (Not Yet Implemented)"
  );
});
// app.delete(
//   "/users/:Username",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     Users.findOneAndRemove({ Username: req.params.Username })
//       .then((user) => {
//         if (!user) {
//           res.status(400).send(req.params.Username + " was not found");
//         } else {
//           res.status(200).send(req.params.Username + " was deleted.");
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send("Error: " + err);
//       });
//   }
// );

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
