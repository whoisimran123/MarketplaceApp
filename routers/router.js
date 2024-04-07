const Router = require('express').Router()
const {registerUser,loginUser} = require('../controllers/userController');
const {createProduct,sellerProduct,buyerProduct,updateProduct} = require('../controllers/productController');
const {addtocart,fetchCart,placeOrder,getOrder,orderUpdate,sendMessage} = require('../controllers/cartController')
const verifyAuth = require('../middleware/verifyAuth');
const Upload = require('../utils');


Router.post('/register', registerUser);

Router.post('/login', loginUser)

Router.post('/product/create',verifyAuth,Upload.single('image'),createProduct);

Router.patch('/product/update/:productId',verifyAuth,Upload.single('image'),updateProduct);

Router.get('/product/seller',verifyAuth, sellerProduct)

Router.get('/product/buyer',verifyAuth, buyerProduct)

Router.post('/cart/add',verifyAuth,addtocart)

Router.get('/cart/list',verifyAuth,fetchCart)

Router.post('/order/place',verifyAuth,placeOrder)

Router.get('/order/list',verifyAuth,getOrder)

Router.patch('/order/update/:orderId',verifyAuth,orderUpdate)

Router.post('/send/message',verifyAuth, sendMessage)

module.exports = Router;