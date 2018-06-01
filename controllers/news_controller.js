var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var mongojs = require("mongojs");

var databaseUrl = "mongoHeadlines"
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);

db.on("error", function (error) {
    console.log("Mongoose Error: ", error);
});

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
// var MONGODB_URI = "process.env.MONGODB_URI || mongodb://localhost/mongoHeadlines";

// // Set mongoose to leverage built in JavaScript ES6 Promises
// // Connect to the Mongo DB
// mongoose.Promise = Promise;
// mongoose.connect(MONGODB_URI);

// var dbmon = mongoose.connection;

// dbmon.on("error", function(error){
//     console.log("Mongoose Error: ", error);
// });

// dbmon.once("open", function(){
//     console.log("Mongoose connection successful.");
// });

var hbsObject={};

router.get("/", function (req, res) {
    // db.scrapedData.find({}, function (err, found) {
    //     if (err) {
    //         console.log(err);
    //     } else {
            
    //         var hbsObject = { articles: found };
    //         console.log(hbsObject);
    //         res.render("index", hbsObject);
    //     };
    // });
    res.render("index", hbsObject);
});

router.get("/all", function (req, res) {
    db.scrapedData.find({}, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            res.json(found);
        }
    });
});

router.get("/scrape", function (req, res) {
    var currentData = [];
    db.scrapedData.find({}, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            currentData = found;
        }
    });


    request("https://techcrunch.com/", function (error, response, html) {

        var test = false;
        var $ = cheerio.load(html);
        $(".post-block").each(function (i, element) {
            var title = $(this).children(".post-block__header").children("h2").children("a").text();
            var link = $(this).children(".post-block__header").children("h2").children("a").attr("href");
            var summary = $(this).children(".post-block__content").text();
            var author = $(this).find(".river-byline__authors").find("a").text();

            for (i = 0; i < currentData.length; i++) {
                if (title === currentData[i].title) {
                    test = true;
                    break;
                };
            };

            if (title && link && !test) {
                // console.log("title: " + title + " link: " + link + " summary: " + summary + " author: " + author);
                // console.log(summary);
                db.scrapedData.save({
                    title: title,
                    link: link,
                    summary: summary,
                    author: author
                }, function (error, saved) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(saved);
                    }
                });
            }
        });
        db.scrapedData.find({}, function (err, found) {
            if (err) {
                console.log(err);
            } else {
                
                hbsObject = { articles: found };
                console.log(hbsObject);
                res.redirect("/");
            };
        });

    });

});

module.exports = router;