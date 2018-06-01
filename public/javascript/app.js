$(document).ready(function () {

    $("#scrapeButton").on("click", function () {
        $.ajax("/scrape", {
            type: "GET",
        }).then(
            function () {
                console.log("page should load");
                location.reload();
            }
        );
    })



});