const TelegramBot = require('node-telegram-bot-api');
var mongoose = require('mongoose');
var fs = require('fs');

var strings = {
    'twice': "شما قبلا این نامه را امضا کرده‌اید :)",
    'name': "لطفا نام و نام خانوادگی خود را وارد کنید.",
    'connection': "لطفا نوع ارتباط خود با مسئله‌ی پیش آمده را انتخاب کنید.",
    'email': "لطفا ایمیل خود را وارد کنید.",
    'school': "لطفا نام مرکز سمپاد مرتبط با خود را وارد کنید.",
    'university': "لطفا رشته‌ی تحصیلی، دانشگاه و مقطع تحصیلی خود را وارد کنید.",
    'description': "**معرفی اجمالی خود**" + "\n" +
    "در این بخش به اختصار به مواردی از این قبیل اشاره بفرمایید: افتخارات علمی، فرهنگی، قرآنی و... خود نظیر مدال المپیاد، رتبه کنکور، موفقیت پژوهشی و... همچنین سوابق کاری ویژه یا فعالیت خاص در زمینه تعلیم و تربیت",
    'welcome': "به بات تلگرام احیای سمپاد خوش آمده‌اید. لطفا مشخصات خود را وارد کنید.",
}


var token
fs.readFile('token.txt', 'utf8', function (err, data) {
    if (err) {
        console.log('token read error!')
    }
    token = data;
    createBot();
    console.log(token)
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

var bot
function createBot() {
    bot = new TelegramBot(token, {polling: true});
    bot.on('message', (msg) => {
        const chatId = msg.chat.id
        userModel.findOne({'chatId': chatId}, function (err, data) {
            if(err)
                throw err
            if(data) {
                bot.sendMessage(chatId, strings['twice'])
            } else {
                startForm(chatId);
            }
        })
    })
}



function startForm(chatId) {

    bot.sendMessage(chatId, strings['welcome'])
}