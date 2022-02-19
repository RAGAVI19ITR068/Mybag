const express = require('express');
const router = express.Router();
const Auth = require('../models/user');
const Product = require('../models/product');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { exists } = require('../models/user');

const requiredLogin = (req, res, next) => {
    if (!req.session.user_id) {
        req.flash('error', "Session expired");
        return res.redirect('/Mybag/login');
    }
    next();
}

router.get('/', requiredLogin, async (req, res) => {
    res.send("This is the home page!...");
    res.redirect('/Mybag/login/res');
})

//New user registration
router.get('/Mybag/register', (req, res) => {
    res.render('register');
})
router.post('/Mybag/register', async (req, res) => {
    const { username, password, reenterpassword } = req.body;
    if (username && (password && reenterpassword)) {
        const exists = await Auth.findOne({ username: username });
        if (exists) {
            req.flash('error', "User already exists");
            res.redirect('/Mybag/register');
        }
        if (password.length < 6) {
            req.flash('error', "Passwords should be atleast 6 characters");
            res.redirect('/Mybag/register');
        }
        if (password !== reenterpassword) {
            req.flash('error', "Passwords should be match");
            res.redirect('/Mybag/register');
        } else {
            const hash = await bcrypt.hash(password, 10);
            const auth_user = new Auth({ username, password });
            await auth_user.save();
            req.session.user_id = auth_user._id;
            req.flash('success', "Successfully signing up");
            res.redirect(`/Mybag/register/${req.session.user_id}`);
        }
    } else {
        req.flash('error', "All fields required");
        res.redirect('/Mybag/register');
    }

})
router.get('/Mybag/register/:id', requiredLogin, async (req, res) => {
    const { id } = req.params;
    const user = await Auth.findById(id);
    const productsMen = await Product.find({ category: "Men" })
    const productsWomen = await Product.find({ category: "Women" })
    res.render('index', { user, productsMen, productsWomen, category: 'All' });
})

//login for registered user and admin
router.get('/Mybag/login', (req, res) => {
    res.render('login');
})
router.post('/Mybag/login', async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const exists = await Auth.findOne({ username: username });
        if (!exists) {
            req.flash('error', "Username not found");
            res.redirect('/Mybag/login');
        }
        else {
            const foundUser = await Auth.findAndValidate(username, password);
            if (foundUser) {
                req.session.user_id = foundUser._id;
                if (username === "Admin") {
                    req.flash('success', "Successfully login as an Admin");
                    res.redirect('/Mybag/login/res');
                } else {
                    req.flash('success', "Successfully login as a User");
                    res.redirect('/Mybag/login/res');
                }
            } else {
                req.flash('error', "Username or password is incorrect");
                res.redirect('/Mybag/login');
            }
        }
    } else {
        req.flash('error', "All fields required");
        res.redirect('/Mybag/login');
    }

})
router.get('/Mybag/login/res', requiredLogin, async (req, res) => {
    const user = await Auth.findById(req.session.user_id);
    const productsMen = await Product.find({ category: "Men" })
    const productsWomen = await Product.find({ category: "Women" })
    res.render('index', { user, productsMen, productsWomen, category: 'All' });
})

//logout for both admin and user
router.post('/Mybag/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/Mybag/login');
})

module.exports = router;