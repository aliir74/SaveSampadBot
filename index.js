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
    'sure': "آیا اطلاعات خود را درست وارد کرده‌اید؟",
    'saveerror': "متاسفانه اطلاعات شما به درستی ذخیره نشدند. دوباره تلاش کنید."
    'savesuccessful': "اطلاعات شما با موفقیت ذخیره شد. :)"
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
    email: String,
    school: String,
    university: String,
    description: String,
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
    bot.sendMessage(chatId, strings['name'])
    newuser = {
        'chatId': chatId,
        'name': "",
        'typeOfConnection': "",
        'email': "",
        'school': "",
        'university': "",
        'description': "",
    }
    bot.on('message', (msg) => {
        newuser['name'] = msg.text
        bot.sendMessage(chatId, strings['connection'])
        bot.on('message', (msg) => {
            newuser['typeOfConnection'] = msg.text
            bot.sendMessage(chatId, strings['email'])
            bot.on('message', (msg) => {
                newuser['email'] = msg.text
                bot.sendMessage(chatId, strings['school'])
                bot.on('message', (msg) => {
                    newuser[school] = msg.text
                    bot.sendMessage(chatId, strings['university'])
                    bot.on('message', (msg) => {
                        newuser['university'] = msg.text
                        bot.sendMessage(chatId, strings['description'])
                        bot.on('message', (msg) => {
                            newuser['description'] = msg.text
                            addUser(chatId, newuser)
                        })
                    })
                })
            })
        })
    })
}

function addUser(chatId, user) {
    bot.sendMessage(chatId, strings['sure'], {
        "reply_markup" : {
            "keyboard": [["بله"], ["خیر"]]
        }
    })
    bot.on('message', (msg) => {
        if(msg.text == "بله") {
            userModel.create({}, function (err, newuser) {
                if(err) {
                    throw err
                    bot.sendMessage(chatId, strings['saveerror'])
                    startForm()
                    return
                }
                bot.sendMessage(chatId, strings['savesuccessful'])
            })
        } else {
            startForm()
        }
    })


}