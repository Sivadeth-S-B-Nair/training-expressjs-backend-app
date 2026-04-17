const jwt=require("jsonwebtoken");

function verifyToken(req,res,next){
    // const token=req.header.token;
    const authHeader = req.header("Authorization");

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            success:false,
            message:"Access denied! No token provided."
        })
    }

    const token=authHeader.split(" ")[1];

    try{
        const decoded= jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next()  
    }
    catch(err){
        return res.status(401).json({
            success:false,
            errorCode: "AUTH_TOKEN_EXPIRED",
            message:"Invalid or expired token!"
        })
    }
}


module.exports={verifyToken};