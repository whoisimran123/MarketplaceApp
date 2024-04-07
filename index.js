const express = require('express');
require('dotenv').config();
require('./database/conn')
const app = express();
const Router = require('./routers/router');

const PORT = process.env.PORT || 8000

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', Router);

app.listen(PORT,()=>{
    console.log(`App is listening on ${PORT}`)
});