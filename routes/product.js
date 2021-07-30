const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const Product = require('../models/product');
const Auth = require('../models/user');

router.use(methodOverride('_method'));

const categories = ['Men', 'Women'];
const ratings = [5.0, 4.0, 3.0, 2.0, 1.0];

router.get('/products', async (req, res) => {
    const { category } = req.query;
    const user = await Auth.findById(req.session.user_id)
    if (category) {
        const products = await Product.find({ category })
        res.render('index', { user, products, category })
    } else {
        const productsMen = await Product.find({category: "Men"})
        const productsWomen = await Product.find({category: "Women"})
        res.render('index', { user, productsMen, productsWomen, category: 'All' })
    }
})

router.get('/additem', (req, res) => {
    res.render('addItems', { categories, ratings })
})
router.post('/additem', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    req.flash('success', "Item is added successfully");
    res.redirect(`/showitem/${newProduct._id}`)
})

router.get('/showitem/:id', async (req, res) => {
    const { id } = req.params;
    const user = await Auth.findById(req.session.user_id);
    const product = await Product.findById(id)
    res.render('show', { user, product })
})

router.get('/item/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('edit', { product, categories, ratings })
})

router.put('/item/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash('success', "Item updated successfully");
    res.redirect(`/showitem/${product._id}`);
})

router.delete('/item/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    req.flash('success', "Item deleted successfully");
    res.redirect('/products');
})

module.exports = router;