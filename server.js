const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const hbhs = require('express-handlebars');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

axios.get("http://www.espn.com/espn/latestnews").then(function(response) {

    const $ = cheerio.load(response.data);

    const results = [];
    console.log($("ul.inline-list.indent"));

    const c = [job1, job2];
 
    $("ul.inline-list.indent").each(function(i, element) {

        console.log("i" + i + "element" + element);
        const title = $(element).text();

        const link = $(element).parent().attr("href");

        results.push({

            title: title,
            link: link
        });

    });
    console.log(results);

});

app.listen(PORT, function() {
    console.log("Listening on port " + PORT);
});