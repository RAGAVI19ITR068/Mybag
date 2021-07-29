const express = require('express');
const router = express.Router();
const Product = require('../models/product');

const categories = ['Men', 'Women'];
const ratings = [5, 4, 3, 2, 1];

router.get('/products', async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
        res.render('index', { products, category })
    } else {
        const products = await Product.find({})
        res.render('index', { products, category: 'All' })
    }
})

router.get('/additem', (req, res) => {
    res.render('addItems', { categories, ratings })
})
router.post('/additem', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/additem/${newProduct._id}`)
})

router.get('/additem/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    res.render('show', { product })
})

module.exports = router;