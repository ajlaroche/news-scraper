var express = require("express");
// var mongojs = require("mongojs");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var routes = require("./controllers/news_controller");

var app = express();

var PORT = process.env.PORT || 3000;

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = "process.env.MONGODB_URI || mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var collections = ["scrapedData"];

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", routes);

app.use(express.static("public"));

app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
  });