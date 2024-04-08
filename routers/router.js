const Router = require('express').Router()
const { registerUser, loginUser } = require('../controllers/userController');
const { createProduct, sellerProduct, buyerProduct, updateProduct } = require('../controllers/productController');
const { addtocart, fetchCart, placeOrder, getOrder, orderUpdate, sendMessage } = require('../controllers/cartController')
const verifyAuth = require('../middleware/verifyAuth');
const Upload = require('../utils');
const { firstnameValidation, lastnameValidation, emailValidation, passwordValidation, mobileValidation, titleValidation, descriptionValidation, priceValidation } = require('../validation/index');

const validate = require('../middleware/validation')


Router.post('/register',firstnameValidation,lastnameValidation,emailValidation,passwordValidation,mobileValidation,validate, registerUser);

Router.post('/login',emailValidation,passwordValidation,validate,loginUser)

Router.post('/product/create', verifyAuth, Upload.single('image'), createProduct);

Router.patch('/product/update/:productId', verifyAuth, Upload.single('image'), updateProduct);

Router.get('/product/seller', verifyAuth, sellerProduct)

Router.get('/product/buyer', verifyAuth, buyerProduct)

Router.post('/cart/add', verifyAuth, addtocart)

Router.get('/cart/list', verifyAuth, fetchCart)

Router.post('/order/place', verifyAuth, placeOrder)

Router.get('/order/list', verifyAuth, getOrder)

Router.patch('/order/update/:orderId', verifyAuth, orderUpdate)

Router.post('/send/message', verifyAuth, sendMessage)

module.exports = Router;