const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const axios = require('axios');
const cheerio = require('cheerio');


const db = require("./models");
const app = express();
const PORT = process.env.PORT || 3002;

// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/philly_db";

// mongoose.connect(MONGODB_URI);

mongoose.connect("mongodb://localhost/philly_db", { useNewUrlParser: true });

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
    res.send("Scraped data has been added to the db");
  });
});

//setup route for homepage
app.get('/', function (req, res) {
  db.Article.find({"home": false}, function(error, data) {
    const hbsObject = {
      articles: data
    };
    console.log(hbsObject);
    res.render('home', hbsObject);
  });
    
});

app.get("/", function(req, res) {
  db.Article.find({"home": true}).populate("notes").exec(function(error, articles) {
    const hbsObject = {
      articles: data
    };
    res.render("home", hbsObject);
  });
});

app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route get specific article by id (unique identifier), then add notes
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Route for save / update each article
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        //update the specific article based on the users note
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

app.listen(PORT, function() {
    console.log("Listening on port " + PORT);
});