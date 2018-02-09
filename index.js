const TelegramBot = require('node-telegram-bot-api');
var mongoose = require('mongoose');
var fs = require('fs');

var strings = {
    'twice': "شما قبلا این نامه را امضا کرده‌اید :)",
}


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


var userSchema = mongoose.Schema({
    chatId: Number,
    name: String,
    typeOfConnection: String,
    Email: String,
    School: String,
    University: String,
    Description: String,
});

var userModel = mongoose.model('userModel', userSchema)

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    const chatId = msg.chat.id
    userModel.findOne({'chatId': chatId}, function (err, data) {
        if(err)
            throw err
        if(doc) {
           bot.sendMessage(chat_id, strings['twice'])
        } else {
            startForm();
        }
    })
})

function startFrom() {


}