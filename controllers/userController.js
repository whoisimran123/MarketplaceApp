const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports ={
    registerUser: async (req,res)=>{
        let body = req.body;
        body.password = bcrypt.hashSync(body.password,10);
        const user = new User(body);
        try {
            let userData = await user.save();
            res.status(200).send({success:true,message: 'User created successfully', userData});
            
        } catch (error) {
            res.status(500).json({success:false,message: error.message});
        }
        
    },
    loginUser: async (req,res)=>{
        let {email,password} = req.body;
        try {
            let user = await User.findOne({email});
            if(user){
                if(bcrypt.compareSync(password,user.password)){
                    const token = jwt.sign({userId:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:'1 days'});
                    res.status(200).send({success:true,message: 'User logged in successfully',token});
                }else{
                    res.status(401).send({success:false,message: 'Invalid password'});
                }
            }else{
                res.status(401).send({success:false,message: 'Invalid email'});
            }
        } catch (error) {
            res.status(500).json({success:false,message: error.message});
        }
    }
}