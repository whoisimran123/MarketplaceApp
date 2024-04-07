const User = require('../models/user');
const Product = require('../models/product');
const fs = require('fs');

module.exports = {
    createProduct: async (req, res) => {
        let sellerId = req.userId;
        try {
            let userData = await User.findOne({ _id: sellerId });
            if (userData && userData.role == 'seller') {

                let body = req.body;
                let imageUrl = req.file.path;

                const newProduct = new Product({ sellerId, imageUrl, ...body });
                try {
                    let product = await newProduct.save();
                    res.status(200).json({ success: true, message: "Product created successfully" })
                } catch (error) {
                    res.status(500).json({ success: false, message: err.message })
                }

            } else {
                res.status(400).json({ success: false, message: 'your are not a Seller' })
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message })
        }
    },
    sellerProduct: async (req, res) => {
        let sellerId = req.userId;
        try {
            let product = await Product.find({ sellerId: sellerId });
            if (product && product.length > 0) {
                res.status(200).json({ success: true, message: "Products Fetch successfully!", data: product })
            } else {
                res.status(404).json({ success: false, message: "Products Not Found!", data: null })
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message })
        }
    },
    buyerProduct: async (req, res) => {
        try{
            let product = await Product.find().select('title description price oldPrice imageUrl')
            if(product && product.length > 0){
                res.status(200).json({ success: true, message: "Products Fetch successfully!", data: product })
            } else {
                res.status(404).json({ success: false, message: "Products Not Found!", data: null })
            }

        }catch(err){
            res.status(500).json({ success: false, message: err.message })
        }
    },
    updateProduct: async (req,res)=>{
        let sellerId = req.userId;
        let productId = req.params.productId;
        try {
            let productData = await Product.findOne({ _id: productId });
            if (productData && Object.keys(productData).length > 0) {

                let body = req.body;
                let imageUrl = req?.file?.path;
                if(!imageUrl){
                    imageUrl = productData.imageUrl;
                }else{
                    fs.unlinkSync(`${__dirname.replace('controllers','')}${productData.imageUrl}`)
                }
                body.imageUrl = imageUrl;
                
                try {
                    // update product data
                    let product = await Product.findByIdAndUpdate(productId,body,{new:true});
                    res.status(200).json({ success: true, message: "Product updated successfully" })
                } catch (error) {
                    res.status(500).json({ success: false, message: err.message })
                }

            } else {
                res.status(400).json({ success: false, message: 'Product Not Found' })
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message })
        }
    }
}