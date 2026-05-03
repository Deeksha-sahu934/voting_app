const express = require('express');
const router = express.Router();

const User = require('./../models/user');

const {jwtAuthMiddleware,generateToken} = require('./../jwt');

console.log("hii");
//post to add user data or signup or create account
router.post('/signup' , async(req,res) => {

    try{
        const data = req.body; // assuming  the request body containd the person dat

         //  If trying to create admin
        if (data.role === 'admin') {
        const existingAdmin = await User.findOne({ role: 'admin' });

            if (existingAdmin) {
                return res.status(400).json({
                message: 'Admin already exists. Only one admin allowed.'
                });
            }   
        }

        // create a new user document using the ,mongoose model
        const newUser = new User(data);

        // save the new user to db
        const response = await newUser.save();
        console.log('data saved');

        const userData = {
            id: response._id,
            role: response.role
        };
        //jwt token 
        const token = generateToken(userData);

        res.status(200).json({response : response, token : token} );
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
    


});

console.log("hii");

// login
router.post('/login' , async (req,res)=>{
    try{

        //extarct username and password
        const {aadharCardNumber, password} = req.body;

        //find user by username
        const user = await User.findOne({aadharCardNumber : aadharCardNumber} );

         if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // generate token // payload = userData
        const userData = {
            id: response._id,
            role: response.role
        };

        const token = generateToken(userData);

        // response
        res.json({token});


    }catch(err){
         console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

// check profile
router.get('/profile' ,jwtAuthMiddleware, async (req, res) =>{
     try {

        // userdata come from jwtAuthMiddleware it is a token
        const userData = req.user;
        console.log('UserData :' , userData);
        const userId = userData.id;
        
        // ❗ hide password
        const user = await User.findById(userId).select('-password');

        // ❗ check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        res.status(200).json({user});

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }

} );

// update password
router.put('/profile/paaword', jwtAuthMiddleware, async(req, res) => {
    try {


         const { role } = req.body;

        if (role === 'admin') {
        const existingAdmin = await User.findOne({ role: 'admin' });

            if (existingAdmin && existingAdmin._id.toString() !== req.params.userId) {
                return res.status(400).json({
                message: 'Only one admin allowed.'
                });
            }
        }

        //extract   id from usertoken
        const  userId =req.user;
        const {currentPassword , newPassword} = req.body;

        const user = await User.findById(userId)

        const isMatch = await user.comparePassword({currentPassword});
        
        if(!isMatch){
            return res.status(404).json({error : 'user not found || incorrect password'});
        }

        // now update
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message : "password updated"});
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router; 
