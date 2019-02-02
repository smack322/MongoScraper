const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const hbhs = require('express-handlebars');
const axios = require('axios');
const cherrio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, function() {
    console.log("Listening on port " + PORT);
});