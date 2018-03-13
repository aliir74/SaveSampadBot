const TelegramBot = require('node-telegram-bot-api');
var mongoose = require('mongoose');
var fs = require('fs');

var token = ""
/*fs.readFile('token.txt', 'utf8', function (err, data) {
    if (err) {
        console.log('token read error!')
    }
    token = data;
    addUsernames();
    console.log(token)
});*/

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
addUsernames()

function addUsernames() {
  const bot = new TelegramBot(token, {polling: true});
  userModel.find({}, async function(err, users) {
    if(!users) {
      return
    }
    for(let i = 0; i < users.length; i++) {
      let chatId = users[i].chatId
      console.log(i, users.length)
      await bot.getChat(chatId).then(function(msg) {
        console.log(i, "done", msg.username)
        users[i].username = msg.username
        users[i].save(function(err, data){
          console.log(i, "saved")
        })
      })
    }
  })
}