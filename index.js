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

app.use("/", express.static("public")); //allow access to multiple files like documentation

app.use((err, req, res, next) => {
  //error handling
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
