var mongoXlsx = require('mongo-xlsx');
var mongoose = require('mongoose');


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

userModel.find({}, function (err, data) {
    var model = mongoXlsx.buildDynamicModel(data);
    mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
        console.log('File saved at:', data.fullPath);
    });
})
