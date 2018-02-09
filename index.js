const TelegramBot = require('node-telegram-bot-api');
var mongoose = require('mongoose');
var fs = require('fs');

var tocken
fs.readFile('tocken.txt', 'utf8', function (err, data) {
    if (err) {
        console.log('tocken read error!')
    }
    tocken = data;
    console.log(tocken)
});

mongoose.connect('mongodb://localhost/savesampad');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log('db connect')
});
