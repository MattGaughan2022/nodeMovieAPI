//node and .load test.js
//look up what u want to do and add 'node module'

// ____________________________________

const http = require("http"),
  fs = require("fs"),
  url = require("url");

http
  .createServer((request, response) => {
    let addr = request.url,
      q = url.parse(addr, true),
      filePath = "index.html";

    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end();
    });
  })
  .listen(8080);
console.log("My test server is running on Port 8080.");
