var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Require all models
var db = require("./models");

// Initialize Express
var app = express();

//Morgan logger for logging requests
app.use(logger("dev"));

//Parse request body as JSON
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

//Public static folder
app.use(express.static("public"));

//Connecting mongoDB to mongoose
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

//Routes
// * Get route for scraping website
app.get("/scrape", function(req, res) {
  axios.get("http://mynorthwest.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    //grab every li tag within a "featured-stories-list leadleft" class.
    $(".featured-stories-list li").each(function(i, element) {
      // save an empty result object
      var result = {};
      
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      // Create a new Article using the "result" object built from scraping
      db.Article.create(result)
      .then(function(dbArticle){
        console.log(dbArticle);
      })
      .catch(function(err) {
        console.log(err);
      });
    });

    //send a message to the client
    res.send("Scrape Complete");
  }); 
});
var PORT = 3000;
//Start the server
app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
  });
