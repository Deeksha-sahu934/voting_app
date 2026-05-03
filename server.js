// create server
const express = require('express');
const app = express();
const db = require('./db');


//for hide sensitive data
require('dotenv').config();

app.use(express.json());

console.log("server started");



const PORT = process.env.PORT ||  3000 ;

const userRoutes = require('./routes/userRoutes')
app.use('/user' , userRoutes);

const candidateRoutes = require('./routes/candidateRoutes')
app.use('/candidate' ,candidateRoutes);



app.listen(PORT , ()=> {
    console.log('listening on port 3000');
})