const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const axios = require('axios');
const cheerio = require('cheerio');


var db = require("./models");
const app = express();
const PORT = process.env.PORT || 3001;

axios.get("https://www.philly.com/").then(function(response) {

    const $ = cheerio.load(response.data);

    const results = [];

    // console.log($("tr td"));
    // console.log("#threadbits_forum_39");
 
    $(".headline-link").each(function(i, element) {

        console.log($(this).children("h4").text());
        console.log($(this).children("a").attr("href"));
        
        results.title = $(this).children("h4").text();
        results.link = $(this).children("a").attr("href");

        db.Article.create(results)
          .then(function(dbArticle) {
              console.log(dbArticle);
          })
          .catch(function(error) {
              console.log(error);
          });
        
        
    });
    console.log(results);

});

//setup handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//setup data transfer 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//setup route for homepage
app.get('/', function (req, res) {
    res.render('home');
});

app.listen(PORT, function() {
    console.log("Listening on port " + PORT);
});