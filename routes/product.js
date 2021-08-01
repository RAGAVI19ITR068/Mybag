const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const { db } = require('../models/product');
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
router.get('/Mybag/additem', async (req, res) => {
    const user = await Auth.findById(req.session.user_id);
    res.render('addItems', { user, categories, ratings })
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
    const user = await Auth.findById(req.session.user_id);
    const product = await Product.findById(id);
    res.render('edit', { user, product, categories, ratings })
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
//Add item to respective user cart
router.get('/Mybag/addmycart/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    await Auth.findByIdAndUpdate(
        req.session.user_id, {
        $addToSet: {
            mycartArray: product._id
        }
    })
    req.flash('success', "Item is added into Mycart successfully");
    res.redirect(`/Mybag/showitem/${product._id}`)
})

//Mycart display
router.get('/Mybag/showmycart', async (req, res) => {
    const user = await Auth.findById(req.session.user_id);
    var product = [];
    var i=0;
    for(let mycart of user.mycartArray){
        product[i] = await Product.findById(mycart);
        i+=1;
    }
    res.render('mycart', { user, product });
})

//Mycart particular item display
router.get('/Mybag/mycart/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('mycartShow', { product });
})

router.get('/Mybag/buy', (req, res) => {
    res.send('You have bought this item successfully');
})

//Delete item from Mycart
router.delete('/Mybag/mycart/deleteitem/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    await Auth.findByIdAndUpdate(
        req.session.user_id, {
        $pull: {
            mycartArray: product._id
        }
    })
    req.flash('success', "Item from your cart is deleted successfully");
    res.redirect('/Mybag/showmycart');
})

module.exports = router;