const TelegramBot = require('node-telegram-bot-api');
var mongoose = require('mongoose');
var fs = require('fs');

var adminUsernames = ['airani_a', 'Ahajiee', 'amirhosseinakhavein']

var strings = {
    'twice': "شما قبلا این نامه را امضا کرده‌اید :)",
    'name': "لطفا نام و نام خانوادگی خود را وارد کنید.",
    'connection': "لطفا نوع ارتباط خود با مسئله‌ی پیش آمده را انتخاب کنید.",
    'email': "لطفا ایمیل خود را وارد کنید."+"\n"+"_در صورت عدم تمایل بر روی متن زیر کلیک کنید._"+"\n"+"/next",
    'school': "لطفا نام مرکز سمپاد مرتبط با خود را وارد کنید.",
    'university': "لطفا مقطع تحصیلی/رشته‌ی تحصیلی/دانشگاه خود را وارد کنید.",
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
    'choice3': "ولی سمپادی هستم.",
    'choice4': "معلم سمپاد هستم.",
    'choice5': "فعال/کارشناس تعلیم و تربیت هستم.",
    'choice7': "دغدغه‌ی این موضوع را دارم و جزء دسته‌های بالا نیستم.",
    'choice6': "فارغ‌التحصیل و دبیر سمپاد هستم."
}


var token = ""
createBot()
/*
fs.readFile('token.txt', 'utf8', function (err, data) {
    if (err) {
        console.log('token read error!')
    }
    token = data;
    createBot();
    console.log(token)
});
*/

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

userSchema.plugin(mongooseToCsv, {
    headers: 'Name typeOfConnection School University Email Description username first_name last_name chatId state',
    constraints: {
        'Name': 'name',
        'typeOfConnection': 'typeOfConnection',
        'School': 'school',
        'University': 'university',
        'Description': 'description',
        'Email': 'email',
        'username': 'username',
        'first_name': 'first_name',
        'last_name': 'last_name',
        'state': 'state',
        'chatId': 'chatId',
    }
})

var userModel = mongoose.model('userModel', userSchema)

// Create a bot that uses 'polling' to fetch new updates

var bot
function createBot() {
    bot = new TelegramBot(token, {polling: true});
    bot.on('message', (msg) => {
        const chatId = msg.chat.id
        if(chatId == 57692552 || msg.username == adminUsernames[0] || msg.username == adminUsernames[1] || msg.username == adminUsernames[2]) {
            if(msg.text == '/excel') {
                createCSV(chatId)
                return
            } else if(msg.text == '/count') {
                userModel.count({}, function (err, data) {
                    if(err) {
                        throw err
                        return
                    }
                    bot.sendMessage(chatId, "Count is "+data.toString())
                })
                return
            }
        }
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
                            "keyboard": [[strings['choice1'], strings['choice2']], [strings['choice3'], strings['choice4']], [strings['choice5'], strings['choice6']], [strings['choice7']]],
                            "one_time_keyboard": true
                        }
                    })
                } else if(user.state == 2) {
                    user['typeOfConnection'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['school'])
                } else if(user.state == 3) {
                    user['school'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['university'])
                } else if(user.state == 4) {
                    user['university'] = msg.text
                    user['state'] += 1
                    bot.sendMessage(chatId, strings['email'], {parse_mode: 'Markdown'})
                } else if(user.state == 5) {
                    if(msg.text != '/next') {
                        user['email'] = msg.text
                    }
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

function createCSV(chatId) {
    /*
    var date = new Date()
    userModel.find({}, function (err, data) {
        fs.createWriteStream('users'+date.getHours().toString()+'.csv')
    })
    stream.on('finish', function () {
        bot.sendDocument(chatId, stream)
    })
    */

    userModel.find({}, function (err, data) {
        var model = mongoXlsx.buildDynamicModel(data);
        mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
            bot.sendMessage(chatId, 'File saved at:', data.fullPath)
            bot.sendDocument(chatId, data.fullPath);
        });
    })

}