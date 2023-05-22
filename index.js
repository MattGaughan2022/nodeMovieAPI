// What information could the client want to retrieve (or GET) from the server?
//list of movies, their directors, genres, actors?
// What information could it want to add (or POST)?
//add a new list to their account, add a movie to their list
// What information could your client want to update (PUT)?
//remove a movie from their list, change favorite genre on their account
//update user info
// What information could your client want to remove (DELETE)?
//delete list from their account, deactivate their account
//npm install mongoose
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://127.0.0.1:27017/movieDB", {
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

let topMovies = [
  {
    title: "Spirited Away",
    director: "Hayao Miyazaki",
  },
  {
    title: "Saving Private Ryan",
    director: "Steven Spielberg",
  },
  {
    title: "The Truman Show",
    director: "Peter Weir",
  },
  {
    title: "Casino Royale (2006)",
    director: "Martin Campbell",
  },
  {
    title: "Interstellar",
    director: "Christopher Nolan",
  },
  {
    title: "42",
    director: "Brian Helgeland",
  },
  {
    title: "Hereditary",
    director: "Ari Aster",
  },
  {
    title: "Black Panther",
    director: "Ryan Coogler",
  },
  {
    title: "Inception",
    director: "Christopher Nolan",
  },
  {
    title: "Coco",
    director: "Adrian Molina, Lee Unkrich",
  },
];

// setup the logger
app.use(morgan("common", { stream: accessLogStream }));

app.get("/", (req, res) => {
  res.send("Default text of my choosing!");
});

app.get("/secreturl", (req, res) => {
  res.send("This is a secret url with super top-secret content.");
});

app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/users/:Username", (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/movies/:movieTitle", (req, res) => {
  Movies.findOne({ Title: req.params.movieTitle })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/genres", (req, res) => {
  res.send(
    "Successful GET request via genre name returning data describing/listing all genres"
  );
});

app.get("/genres/:name", (req, res) => {
  res.send(
    "Successful GET request via genre name returning data describing the specified genre"
  );
});

app.get("/directors/:name", (req, res) => {
  res.send(
    "Successful GET request via name of a director, returning data describing the specified director (bio, birth year, [death year])"
  );
});

app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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
});

app.put("/users/:Username", (req, res) => {
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
});

app.post("/user/lists/:name", (req, res) => {
  res.send("Successful POST request for creating a new movie list");
});

app.put("/user/lists/:name", (req, res) => {
  res.send("Successful PUT request for updating list info (add movie)");
});
app.delete("/user/lists/:name", (req, res) => {
  res.send("Successful DELETE request for updating list info (remove movie)");
});
app.delete("/users/:Username", (req, res) => {
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
});

app.use("/", express.static("public")); //allow access to multiple files like documentation

app.use((err, req, res, next) => {
  //error handling
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
