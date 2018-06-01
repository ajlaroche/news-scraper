var express = require("express");
// var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var routes = require("./controllers/news_controller");

var app = express();

var PORT = process.env.PORT || 3000;

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", routes);

app.use(express.static("public"));

app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
  });