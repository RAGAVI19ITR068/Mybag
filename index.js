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
const session = require('express-session');
const flash = require('connect-flash');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())

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
app.use(passport.initialize());
app.use(passport.session());

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

const admin_pw = async (pw) => {
    const hash = await bcrypt.hash(pw, 10);
    const auth_user = new Auth({
        username: "Admin",
        password: hash
    });
    await auth_user.save();
}
admin_pw("admin1@mybag");

app.get('/home_admin', requiredLogin, (req, res) => {
    res.render('adminPage');
})
app.get('/home_user', requiredLogin, (req, res) => {
    res.render('userPage');
})

app.listen(2000, async () => {
    console.log("listening to the port 2000!...");
})