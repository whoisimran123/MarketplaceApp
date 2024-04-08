const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

const express = require('express');
const http = require('http');

const socketIo = require('socket.io');
const amqp = require('amqplib');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// RabbitMQ connection details
const rabbitMQUrl = 'amqp://localhost'; // RabbitMQ Host Address
const orderQueueName = 'orderQueue'; // for order queues
const messageQueueName = 'messageQueue'; // for message queues
let channel;

amqp.connect(rabbitMQUrl)
    .then((connection) => {
        return connection.createChannel();
    })
    .then((ch) => {
        channel = ch;
        channel.assertQueue(orderQueueName);
        channel.assertQueue(messageQueueName);

        // Listen for new messages in order queue
        channel.consume(orderQueueName, (msg) => {
            const order = JSON.parse(msg.content.toString());
            console.log('New order received:', order);
            io.emit('newOrder', order);
        }, { noAck: true });

        // Listen for new messages in message queue
        channel.consume(messageQueueName, (msg) => {
            const message = JSON.parse(msg.content.toString());
            console.log('New message received:', message);
            io.emit('message', message);
        }, { noAck: true });

        console.log('Connected to RabbitMQ');
    })
    .catch((error) => {
        console.error('Error connecting to RabbitMQ:', error);
    });

//creating user addtocart functionality
module.exports = {
    addtocart: async (req,res)=>{
        let userId = req.userId;
        let {productId,quantity} = req.body;
        try {
            let user =  await User.findOne({_id: userId})
            if(user && Object.keys(user).length > 0){
                let product = await Product.findOne({_id: productId})

                if(product && Object.keys(product).length > 0){
                    // if productId is already present
                    if(product.maxQuantity == 0){
                        return res.status(400).json({success: false, message: "Product is out of stock"})
                    }
                   
                    let productIndex = user.cart.findIndex(item => item.productId.toString() === productId.toString())
                    if(productIndex > -1){
                        if(product.maxQuantity >=  user.cart[productIndex].quantity + quantity){

                            user.cart[productIndex].quantity += quantity;
                            await user.save();
                            res.status(200).json({success: true, message: "Product updated in cart successfully!"})
                        }else{
                            res.status(400).json({success: false, message: "You can't add more than " + product.maxQuantity + " " + product.title + " to cart!"})
                        }
                    }else{
                        if(product.maxQuantity >= quantity){
                            user.cart.push({productId:productId,quantity:quantity})
                            await user.save();
                            res.status(200).json({success: true, message: "Product added to cart successfully!"})
                        }else{
                            res.status(400).json({success: false, message: "You can't add more than " + product.maxQuantity + " " + product.title + " to cart!"})
                        }
                        
                    }   
                }else{
                    res.status(404).json({success: false, message: "Product Not Found!"})
                }
            }else{
                res.status(404).json({success: false, message: "User Not Found!"})
            }
            
        } catch (error) {
            res.status(500).json({success: false, message: error.message})
        }

    },
    fetchCart: async(req, res) => {
        try{
            let userId = req.userId;
            let user =  await User.findOne({_id: userId})
            if(user && Object.keys(user).length > 0){
                if(user.cart && user.cart.length > 0){
                    
                    res.status(200).json({ success: true, message: "cart Fetch successfully!", data: user.cart })
                }else{
                    res.status(404).json({ success: false, message: "Cart is empty!" })
                }
            } else {
                res.status(404).json({ success: false, message: "Not a valid user!" })
            }
            
        } catch (error) {
            res.status(500).json({success: false, message: error.message})
        }
    },
    placeOrder: async (req, res) => {
        let userId = req.userId;
        let user =  await User.findOne({_id: userId})
        if(user && Object.keys(user).length > 0){
            if(user.cart && user.cart.length > 0){
                user.cart.forEach(async (item)=>{
                    let product = await Product.findOne({_id: item.productId})
                    if(product && Object.keys(product).length > 0){
                        product.maxQuantity -= item.quantity;
                        await product.save();

                        let order = new Order({
                            productId: product._id,
                            sellerId: product.sellerId,
                            buyerId: user._id,
                            quantity: item.quantity,
                            totalPrice: product.price * item.quantity,
                            status: 'pending',
                            timestamp: Date.now()
                        })
                        channel.sendToQueue(orderQueueName, Buffer.from(JSON.stringify(order)));
                        await order.save();
                    }
                })
               
                user.cart = [];
                await user.save();
                res.status(200).json({ success: true, message: "Order placed successfully!" })
            }else{
                res.status(404).json({ success: false, message: "Cart is empty!" })
            }
        } else {
            res.status(404).json({ success: false, message: "Not a valid user!" })
        }

    },
    getOrder: async (req,res)=>{
        let userId = req.userId;
        let user =  await User.findOne({_id: userId})
        if(user && Object.keys(user).length > 0){
            let order = await Order.find({buyerId: user._id}).select('buyerId quantity totalPrice status')
            if(order && order.length > 0){
                res.status(200).json({ success: true, message: "Order Fetch successfully!", data: order })
            } else {
                res.status(404).json({ success: false, message: "Order Not Found!" })
            }
        } else {
            res.status(404).json({ success: false, message: "Not a valid user!" })
        }
    },
    orderUpdate: async(req, res) =>{
        const { orderId } = req.params;
        const { status } = req.body;
        try {
            let order = await Order.findOne({_id: orderId})
            if(order && Object.keys(order).length > 0){
                order.status = status;
                await order.save();
                res.status(200).json({ success: true, message: "Order updated successfully!" })
            } else {
                res.status(404).json({ success: false, message: "Order Not Found!" })
            }
            
        } catch (error) {
            res.status(500).json({success: false, message: error.message})
        }

    },
    sendMessage: async (req,res)=>{
        let userId = req.userId;
        let user =  await User.findOne({_id: userId})
        if(user && Object.keys(user).length > 0){
            let { message } = req.body;
            message = `Message from ${user.firstname} ${message}`
            channel.sendToQueue(messageQueueName, Buffer.from(JSON.stringify(message)));
            res.status(200).json({ success: true, message: "Message sent successfully!" })
        } else {
            res.status(404).json({ success: false, message: "Not a valid user!" })
        }
    }
}