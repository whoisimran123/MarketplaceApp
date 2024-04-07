const mongoose = require('mongoose');

const DB_URL = process.env.DB_URL;


mongoose.connect(DB_URL)
.then(()=>{
    console.log("DB connection established")
}).catch((err)=>{
    console.log("Error connecting ", err.message)
})
