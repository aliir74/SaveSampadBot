const TelegramBot = require('node-telegram-bot-api');
var mongoose = require('mongoose');
var fs = require('fs');

var strings = {
    'twice': "شما قبلا این نامه را امضا کرده‌اید :)",
    'name': "لطفا نام و نام خانوادگی خود را وارد کنید.",
    'connection': "لطفا نوع ارتباط خود با مسئله‌ی پیش آمده را انتخاب کنید.",
    'email': "لطفا ایمیل خود را وارد کنید."+"\n"+"_در صورت عدم تمایل بر روی متن زیر کلیک کنید._"+"\n"+"/next",
    'school': "لطفا نام مرکز سمپاد مرتبط با خود را وارد کنید.",
    'university': "لطفا رشته‌ی تحصیلی، دانشگاه و مقطع تحصیلی خود را وارد کنید.",
    'description': '*معرفی اجمالی خود:*' + "\n\n" +
    "_در این بخش به اختصار به مواردی از این قبیل اشاره بفرمایید: افتخارات علمی، فرهنگی، قرآنی و... خود نظیر مدال المپیاد، رتبه کنکور، موفقیت پژوهشی و... همچنین سوابق کاری ویژه یا فعالیت خاص در زمینه تعلیم و تربیت_",
    'welcome': "سلام\n" +
    "سپاسگزاریم که برای سمپاد به پا خاسته اید و از این طریق، نامه به رهبری برای نجات و احیای سمپاد را امضا می کنید.",
    'sure': "آیا اطلاعات خود را درست وارد کرده‌اید؟",
    'saveerror': "متاسفانه اطلاعات شما به درستی ذخیره نشدند. دوباره تلاش کنید.",
    'savesuccessful': "امضای شما پای\n" +
    "\"نامه به رهبری " +
    "برای نجات و احیای سمپاد\"\n" +
    "با موفقیت ثبت شد.\n" +
    "\n" +
    "به امید نجات و احیای سمپاد",
    'choice1': "فارغ‌التحصیل سمپاد هستم.",
    'choice2': "دانش‌آموز سمپاد هستم.",
    'choice3': "ولی دانش‌آموز یا ولی فارغ‌التحصیل هستم.",
    'choice4': "معلم سمپاد هستم.",
    'choice5': "فعال/کارشناس تعلیم و تربیت هستم.",
    'choice6': "دغدغه‌ی این موضوع را دارم و جزء دسته‌های بالا نیستم.",
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
    username: String,
    first_name: String,
    last_name: String,
    name: String,
    typeOfConnection: String,
    email: String,
    school: String,
    university: String,
    description: String,
    state: Number,
});

var userModel = mongoose.model('userModel', userSchema)

// Create a bot that uses 'polling' to fetch new updates

var bot
function createBot() {
    bot = new TelegramBot(token, {polling: true});
    bot.on('message', (msg) => {
        const chatId = msg.chat.id
        userModel.findOne({'chatId': chatId}, function (err, user) {
            if(err)
                throw err
            if(msg.text == 'reset') {
                console.log(user)
                user['state'] = 0
                user.name = ''
                user.school = ''
                user.university = ''
                user.description = ''
                user.typeOfConnection = ''
                user.email = ''
                user.save()
                bot.sendMessage(chatId, strings['welcome'])
                setTimeout(() => {bot.sendMessage(chatId, strings['name'])}, 500)
            } else
            if(user) {
                if(user.state == 0) {
                    bot.sendMessage(chatId, strings['welcome'])
                    setTimeout(() => {bot.sendMessage(chatId, strings['name'])}, 500)
                }
                if(user.state == 1) {
                    user['name'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['connection'], {
                        "reply_markup": {
                            "keyboard": [[strings['choice1'], strings['choice2']], [strings['choice3'], strings['choice4']], [strings['choice5'], strings['choice6']]],
                            "one_time_keyboard": true
                        }
                    })
                } else if(user.state == 2) {
                    user['typeOfConnection'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['email'], {parse_mode: 'Markdown'})
                } else if(user.state == 4) {
                    if(msg.text != '/next') {
                        user['email'] = msg.text
                    }
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['school'])
                } else if(user.state == 3) {
                    user['school'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['university'])
                } else if(user.state == 5) {
                    user['university'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['description'], {parse_mode: "Markdown"})
                } else if(user.state == 6) {
                    user['description'] = msg.text
                    bot.sendMessage(chatId, strings['savesuccessful'])
                    user['state'] += 1

                } else if (user.state > 6) {
                    bot.sendMessage(chatId, strings['twice'])
                }
                else {
                    user['state'] = 1
                }
                user.save()
            } else {
                bot.sendMessage(chatId, strings['welcome'])
                setTimeout(() => {bot.sendMessage(chatId, strings['name'])}, 500)
                userModel.create({'chatId': chatId, 'state': 1, 'first_name': msg.first_name, 'last_name': msg.last_name, 'username': msg.username}, function (err, data) {
                    if (err) return handleError(err)
                })
            }
        })
    })
}