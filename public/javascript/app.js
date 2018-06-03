$(document).ready(function () {

    $("#scrapeButton").on("click", function () {
        window.location.href = "/scrape";
    });

    $("#scraperModal").modal();

    $(document).on("click", ".saveArticleButton", function () {
        var thisId = $(this).attr("data-articleId");

        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: { saved: true }
        }).then(function () {
            console.log("this article id: " + thisId + " was changed to true");
        })
    });

    $(document).on("click", ".deleteArticleButton", function () {
        var thisId = $(this).attr("data-articleId");

        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: { saved: false }
        }).then(function () {
            console.log("this article id: " + thisId + " was changed to false");
            location.reload();
        })
    });

    var articleId="";

    $(document).on("click", ".noteArticleButton", function () {
        articleId = $(this).attr("data-articleId");
        $("#noteModalTitle").text("Notes for article ID " + articleId);
        $.ajax({
            method:"GET",
            url: "/saved/" + articleId
        }).then(function(data){
            console.log(data.note.body);
            $("#notes").append("<p>" + data.note.body + "</p>");
        });
    });

    $("#saveNoteButton").on("click", function () {
        var note = $("#userNotes").val();

        $.ajax({
            method: "POST",
            url: "/saved/" + articleId,
            data: { body: note }
        }).then(function () {
            console.log("Note has been saved to " + articleId);
            $("#userNotes").val("");
            location.reload();
        })
    });

});