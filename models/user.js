const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
      name: {
        type : String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    mobile : {
        type : String,
        required : true
    },
    email : {
        type : String,
    },
    address : {
        type : String,
        required : true,
    },
    aadharCardNumber : {
        type : Number,
        required : true,
        unqiue : true

    },
    password : {
        type : String,
        required : true,
    },
    role : {
        type : String,
        enum : ['admin', 'voter'],
        default : 'voter'
    },
    isVoted : {
        type : Boolean,
        default : false
    }
});

userSchema.index(
    { role: 1 },
    { unique: true, partialFilterExpression: { role: 'admin' } }
);
    

userSchema.pre('save' , async function(){
    const person = this; // for this user

    //hash  the password only if it has been modified (or is new)
    if( !person.isModified('password')) return ; // password is change then hash otherwise dono't

    try{

        // hash password generation
        const salt = await bcrypt.genSalt(10); // 10 is ideal no show complex level of salt
        

        // hash password
        const hashPassword = await bcrypt.hash(person.password , salt);
        person.password = hashPassword ;

        // save in db there is no issuse  callback fun 
        //next();

    }catch(err){
        throw err;
    }

});


userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        const isMatch = await bcrypt.compare(candidatePassword, this.password) ;
        return isMatch ;
    }catch(err){
        throw err;
    }
};



const User = mongoose.model('User' , userSchema);
module.exports = User 