const userService=require("../services/user.service")

async function getProfile(req,res,next) {
    try{
        const user=await userService.findUserById(req.user.userId)
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"  
            })
        }
        res.status(200).json({
            success:true,
            message:"Welcome to your profile!",
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }
        })
    }
    catch(err){
        next(err)
    }
}

module.exports={getProfile}