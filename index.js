// What information could the client want to retrieve (or GET) from the server?
//list of movies, their directors, genres, actors?
// What information could it want to add (or POST)?
//add a new list to their account, add a movie to their list
// What information could your client want to update (PUT)?
//remove a movie from their list, change favorite genre on their account
//update user info
// What information could your client want to remove (DELETE)?
//delete list from their account, deactivate their account

const express = require("express"),
  morgan = require("morgan"), //allows for non-fs logging
  path = require("path");
fs = require("fs");

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

const app = express();

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

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get("/movies/:movieTitle", (req, res) => {
  res.json(
    topMovies.find((movie) => {
      return movie.name === req.params.name;
    })
  );
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

app.post("/users/:name", (req, res) => {
  res.send(
    "Successful POST request for creating/entering data on a new user (registered)"
  );
});

app.put("/user/userInfo/:name", (req, res) => {
  res.send("Successful PUT request for updating user info (name, birthday)");
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
app.delete("/users/:name", (req, res) => {
  res.send("Successful DELETE request for deleting user account");
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
