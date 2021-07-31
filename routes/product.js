const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const Product = require('../models/product');
const Auth = require('../models/user');

router.use(methodOverride('_method'));

const categories = ['Men', 'Women'];
const ratings = [5.0, 4.0, 3.0, 2.0, 1.0];

//index page redirectio which having available products
router.get('/Mybag/products', async (req, res) => {
    const { category } = req.query;
    const user = await Auth.findById(req.session.user_id)
    if (category) {
        const products = await Product.find({ category })
        res.render('index', { user, products, category })
    } else {
        const productsMen = await Product.find({ category: "Men" })
        const productsWomen = await Product.find({ category: "Women" })
        res.render('index', { user, productsMen, productsWomen, category: 'All' })
    }
})

//Admin Part
//Add item into MyBag.shop 
router.get('/Mybag/additem', (req, res) => {
    res.render('addItems', { categories, ratings })
})
router.post('/Mybag/additem', async (req, res) => {
    const { productName, manufacturer, category, rating, price, image, about } = req.body;
    if (productName && manufacturer && category && rating && price && image && about) {
        const newProduct = new Product({ productName, manufacturer, category, rating, price, image, about });
        await newProduct.save();
        req.flash('success', "Item is added successfully");
        res.redirect(`/Mybag/showitem/${newProduct._id}`)
    } else {
        req.flash('error', "All fields required");
        res.redirect('/Mybag/additem');
    }
})

//Show page for particular product
router.get('/Mybag/showitem/:id', async (req, res) => {
    const { id } = req.params;
    const user = await Auth.findById(req.session.user_id);
    const product = await Product.findById(id)
    res.render('show', { user, product })
})

//Edit particular item
router.get('/Mybag/edititem/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('edit', { product, categories, ratings })
})
router.put('/Mybag/edititem/:id', async (req, res) => {
    const { productName, manufacturer, category, rating, price, image, about } = req.body;
    if (productName && manufacturer && category && rating && price && image && about) {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
        req.flash('success', "Item updated successfully");
        res.redirect(`/Mybag/showitem/${product._id}`);
    } else {
        const { id } = req.params;
        const product = await Product.findById(id);
        req.flash('error', "All fields required");
        res.redirect(`/Mybag/edititem/${product._id}`);
    }
})

//Delete particular item
router.delete('/Mybag/deleteitem/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    req.flash('success', "Item deleted successfully");
    res.redirect('/Mybag/products');
})

//User Part

module.exports = router;