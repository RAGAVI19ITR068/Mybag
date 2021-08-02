const express = require('express');
const { render } = require('ejs');
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const Auth = require('./models/user');
const Product = require('./models/product');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const methodOverride = require('method-override');

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(methodOverride('_method'));

app.set('trust proxy',1);
app.use(express.urlencoded({ extended: true }));
const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(Auth.authenticate()));

// passport.serializeUser(Auth.serializeUser());
// passport.deserializeUser(Auth.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', authRoutes);
app.use('/', productRoutes);

const requiredLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
}

app.listen(2000, async () => {
    console.log("listening to the port 2000!...");
})