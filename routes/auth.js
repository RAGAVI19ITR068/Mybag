const express = require('express');
const router = express.Router();
const Auth = require('../models/user');
const Product = require('../models/product');
const bcrypt = require('bcrypt');
const passport = require('passport');

const requiredLogin = (req, res, next) => {
    if (!req.session.user_id) {
        req.flash('error', "Session expired");
        return res.redirect('/login');
    }
    next();
}

router.get('/', (req, res) => {
    res.send("This is the home page!...");
})

router.get('/register', (req, res) => {
    res.render('register');
})
router.post('/register', async (req, res) => {
    const { username, password, reenterpassword } = req.body;
    if (username && (password && reenterpassword)) {
        if (password !== reenterpassword) {
            req.flash('error', "Passwords should be match");
            res.redirect('/register');
        } else {
            const hash = await bcrypt.hash(password, 10);
            const auth_user = new Auth({ username, password });
            await auth_user.save();
            req.session.user_id = auth_user._id;
            req.flash('success', "Successfully signing up");
            res.redirect(`/register/${req.session.user_id}`);
        }
    } else {
        req.flash('error', "All fields required");
        res.redirect('/register');
    }

})
router.get('/register/:id', requiredLogin, async (req, res) => {
    const { id } = req.params;
    const user = await Auth.findById(id);
    const productsMen = await Product.find({category: "Men"})
    const productsWomen = await Product.find({category: "Women"})
    res.render('index', { user, productsMen, productsWomen, category: 'All' });
})


router.get('/login', (req, res) => {
    res.render('login');
})
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const foundUser = await Auth.findAndValidate(username, password);
        if (foundUser) {
            req.session.user_id = foundUser._id;
            if (username === "Admin") {
                req.flash('success', "Successfully login as an Admin");
                res.redirect('/login/res');
            } else {
                req.flash('success', "Successfully login as a User");
                res.redirect('/login/res');
            }
        } else {
            req.flash('error', "Username or password is incorrect");
            res.redirect('/login');
        }
    } else {
        req.flash('error', "All fields required");
        res.redirect('/login');
    }

})
router.get('/login/res', requiredLogin, async (req, res) => {
    const user = await Auth.findById(req.session.user_id);
    const productsMen = await Product.find({category: "Men"})
    const productsWomen = await Product.find({category: "Women"})
    res.render('index', { user, productsMen, productsWomen, category: 'All' });
})

router.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/login');
})

module.exports = router;