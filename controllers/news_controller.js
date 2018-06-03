var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var mongojs = require("mongojs");

var db = require("../models");

// var databaseUrl = "mongoHeadlines"
// var collections = ["scrapedData"];

// var db = mongojs(databaseUrl, collections);

// db.on("error", function (error) {
//     console.log("Mongoose Error: ", error);
// });

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/techcrunch";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// mongoose.connect("mongodb://localhost/techcrunch");

var hbsObject = {};

router.get("/", function (req, res) {
    res.render("index");
});

router.get("/all", function (req, res) {
    db.Article.find({})
        .then(function (found) {
            res.json(found);
        }).catch(function (err) {
            res.json(err);
        });
});

// Get all the saved articles
router.get("/saved", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (found) {
            hbsObject = { articles: found };
            // console.log(hbsObject);
            res.render("saved", hbsObject);
        }).catch(function (err) {
            res.json(err);
        });
});
//Find note associated with associated with saved article id when add note button is hit
router.get("/saved/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (found) {
            console.log(found);
            res.json(found);
        }).catch(function (err) {
            res.json(err);
        });
});

router.get("/scrape", function (req, res) {
    var currentData = [];
    db.Article.find({})
        .then(function (found) {
            currentData = found;
        }).catch(function (err) {
            console.log(err);
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


            if (title && link && summary && !test) {

                db.Article.create({
                    title: title,
                    link: link,
                    summary: summary,
                    author: author,
                }).then(function (saved) {
                    console.log(saved);
                }).catch(function (err) {
                    console.log(err);
                });
            };
        });


        db.Article.find({}).sort({ scrapedOn: -1 }).limit(30).then(function (found) {
            hbsObject = { articles: found };
            // console.log(hbsObject);
            res.render("scraped", hbsObject);
        }).catch(function (err) {
            console.log(err);
        });
    });

});

//Change article status to saved.
router.post("/articles/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: req.body.saved }, { new: true }).then(function (dbArticle) {
        console.log(dbArticle);
        res.sendStatus(200);
    }).catch(function (err) {
        console.log(err)
    });
});

//Add a new note to an article or modify an exisiting one
router.post("/saved/:id_Article/:id_Note", function (req, res) {
    if (req.params.id_Note==0) {
        db.Note.create(req.body).then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id_Article }, { note: dbNote._id }, { new: true });
        })
            .then(function (dbArticle) {
                console.log(dbArticle);
                res.sendStatus(200);
            })
            .catch(function (err) {
                res.json(err);
            });
    } else {
        db.Note.findOneAndUpdate({_id: req.params.id_Note}, {body: req.body.body}).then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id_Article }, { note: dbNote._id }, { new: true });
        })
            .then(function (dbArticle) {
                console.log(dbArticle);
                res.sendStatus(200);
            })
            .catch(function (err) {
                res.json(err);
            });
    }
});

router.delete("/saved/:id_Article/:id_Note", function(req, res){
    db.Note.findOneAndRemove({_id: req.params.id_Note}).then(function (dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id_Article }, { $unset: {note: 1 }}, { new: true });
    })
        .then(function (dbArticle) {
            console.log(dbArticle);
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.json(err);
        });
})

module.exports = router;