// database connectivity

const mongoose = require('mongoose');
require('dotenv').config();

// define the mongoose connection URL
const mongoURL = process.env.MONGODB_URL_local ;  //'maydatabase = database name
//const mongoURL = process.env.MONGODB_URL;

// set up mongoDB connection

mongoose.connect(mongoURL)
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("MongoDB connection failed:", err));
// Get the default connection
// mongoose maintains a default connection obejct representing the mongoDB connection

const db = mongoose.connection;

// event listener foe db connection


db.on('error' , (err)=> {
    console.log(' mongoose connection error' ,err);
});

db.on('disconnected' , ()=> {
    console.log('disConnected   mongoDB');
});

// export  the db connection
module.exports = db;

