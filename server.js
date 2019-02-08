const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const axios = require('axios');
const cheerio = require('cheerio');


var db = require("./models");
const app = express();
const PORT = process.env.PORT || 3001;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/philly_db";

mongoose.connect(MONGODB_URI);

//setup handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//setup data transfer 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/scrape", function(req, res) {

axios.get("https://www.nytimes.com/section/sports").then(function(response) {

    const $ = cheerio.load(response.data);
 
    $(".css-ye6x8s").each(function(i, element) {

        const articles = {
             link: $(this).children(".css-1cp3ece").children(".css-4jyr1y").children("a").attr("href"),
             title: $(this).children(".css-1cp3ece").children(".css-4jyr1y").children("a").children("h2").text(),
             summary: $(this).children(".css-1cp3ece").children(".css-4jyr1y").children("a").children(".css-1echdzn").text()

        }
        console.log(articles);

// add the NY times fields into the database
        db.Article.create(articles)
          .then(function(dbArticle) {
              console.log(dbArticle);
          })
          .catch(function(error) {
              console.log(error);
          });    
        
    });
    res.send("Scrape Complete");
  });
});

//setup route for homepage
app.get('/', function (req, res) {
    res.render('home');
});

app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

app.listen(PORT, function() {
    console.log("Listening on port " + PORT);
});