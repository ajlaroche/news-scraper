var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");

router.get("/", function (req, res) {
    res.render("index");
});

router.get("/all", function(req,res){

});

router.get("/scrape", function(req, res){
    request("https://techcrunch.com/", function(error, response, html){
        var $ = cheerio.load(html);
        $(".post-block").each(function(i, element){
            var title = $(this).children(".post-block__header").children("h2").children("a").text();
            var link = $(this).children(".post-block__header").children("h2").children("a").attr("href");
            var summary = $(this).children(".post-block__content").text();
            var author = $(this).find(".river-byline__authors").find("a").text();

            if (title && link) {
                console.log("title: " + title + " link: " + link + " summary: " + summary + " author: " + author);
                // console.log(summary);
            }
        });
    })
})

module.exports = router;