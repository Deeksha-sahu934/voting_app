const express = require('express');
const router = express.Router();

const Candidate = require('./../models/candidate');
const User = require('./../models/user');

const {jwtAuthMiddleware,generateToken} = require('./../jwt');

//check admin
const checkAdminRole = async (userId)=> {
    try{
        const user = await User.findById(userId);
        if(!user) return false
        return user.role == 'admin';
    }catch(err) {
        return false;
    }
}
//post to add candidate
router.post('/' ,jwtAuthMiddleware, async(req,res) => {

    try{
        if(!(await checkAdminRole(req.user.id))){
            return res.status(404).json({message : 'user has not admin role'});
        }

        const data = req.body; // assuming  the request body contained the candidate data

        // create a new candidate document using the ,mongoose model
        const newCandidate = new Candidate(data);

        // save the new candidate to db
        const response = await newCandidate.save();
        console.log('data saved');


        res.status(200).json({response : response} );
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }

});

// update password
router.put('/:candidateId', jwtAuthMiddleware,  async(req, res) => {
    try {
         if(!(await checkAdminRole(req.user.id))){
            return res.status(404).json({message : 'user has not admin role'});
        }

         //extract worktype from url parameter
        const candidateId = req.params.candidateId; 
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData,{
            new : true,
            runValidators  :true ,
        })
        
        if(!response){
            return res.status(404).json({error : 'candidate not found'});
        }

        console.log(' candidate data updated');
        res.status(200).json(response);

      
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.delete('/:candidateId',jwtAuthMiddleware,  async(req, res) => {
    try {

        if(! (await checkAdminRole(req.user.id))){
            return res.status(404).json({message : 'user does not  have admin role'});
        }

        //extract worktype from url parameter
        const  candidateId =req.params.candidateId;

        const response = await Candidate.findByIdAndDelete(candidateId);
        
        if(!response){
            return res.status(404).json({error : 'person not found'});
        }

        console.log(' candidate data deleted');
        res.status(200).json(response);
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// vote 

router.post('/vote/:candidateId' , jwtAuthMiddleware,async(req, res) => {
    // no admin can vote 
    // user can vote only once

    candidateId = req.params.candidateId;
    userId = req.user.id;

    try{

        //find  candiadate 
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message : "Candidate not found"});
        }

        // find user
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message : "user not found"});
        }

        // vote 
        if(user.isVoted){
            return res.status(404).json({message : "you have already vote"});
        
        }

        if(user.role == "admin"){
           return res.status(404).json({message : "admin is not allowed"});
        
        }

        // update  the candidate document to record the vote
        candidate.votes.push({user : userId})
        console.log("Before:", candidate.voteCount);
        candidate.voteCount++;
        console.log("After:", candidate.voteCount);
        await candidate.save();

        // update the user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({meassage : 'vote recorded successfully'});

    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
    
});

//list of candidates

router.get('/' , async (req,res) => {

    try{
        const candidates = await Candidate.find();

        res.status(200).json(candidates);


    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
    
})

// get vote count
router.get('/vote/count' ,async (req,res) => {

    try{
        //find all candidate and sort them by votecount in des order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // map the candidates to only return their name and vote count
        const voteRecord = candidate.map((data) => {
            return {
                party : data.party,
                count : data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
        
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router; 
