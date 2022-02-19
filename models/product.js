const mongoose=require('mongoose');

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
    console.log("Mongo connection for products open!!!");
}).catch(err => {
    console.log("Mongo connection for products error : ", err);
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error in product db : "));
db.once("open", () => {
    console.log("Database for mybag product is connected");
})

const productSchema=new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    }

})
const Product = mongoose.model('Product',productSchema);
module.exports = Product;