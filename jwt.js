const jwt = require('jsonwebtoken');
// three part of jwt = header payload , signature

const jwtAuthMiddleware = (req,res,next) => {

    //FIRST CHECK req headers has authorization or not
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error : 'token not found'});

    if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token format' });
    }

    //extract the jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if(!token ) return res.status(401).json({error : 'Unauthorized'});


    try{
        // verify the jwt token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //  2 para - secrect key

        //attach user info to request obehect (means payload or token)
        req.user = decoded
        next();

    }catch(err){
        console.error(err);
        res.status(401).json({error : 'Invalid token'});
        
    }
}

console.log("🔥 NEW JWT FILE LOADED");
//Function to generate JWT token 
const generateToken = (userData) => {

    //GENEARTE a new JWT token  using user data
    console.log("INSIDE generateToken:", userData); // 
    return jwt.sign(userData, process.env.JWT_SECRET);
}



module.exports = {jwtAuthMiddleware,generateToken} ;