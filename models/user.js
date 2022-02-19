const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// const dbUrl = process.env.DB_URL;
// 'mongodb://localhost:27017/Mybag-raga'
const uri  = 'mongodb+srv://Raga:raga29Mybag@mybag.wkbap.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
// mongoose.connect(dbUrl);
mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("Mongo connection for authendication is open!!!");
}).catch(err => {
    console.log("Mongo connection (authendication) error : ", err);
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error in authendication db : "));
db.once("open", () => {
    console.log("Database for authendication is connected");
})

const authSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password:{
        type: String,
        required: [true, 'Password cannot be blank']
    },
    mycartArray: {
        type: [String]
    }
});

authSchema.statics.findAndValidate = async function(username, password) {
    const foundUser = await this.findOne({ username });
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser : false;
}

authSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

const Auth = mongoose.model('Auth', authSchema);

module.exports = Auth;