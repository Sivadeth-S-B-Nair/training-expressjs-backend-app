// reads req, calls service, sends res

const authService=require("../services/auth.service");
const tokenService=require("../services/token.service");

async function register(req,res,next) {
    try{
        const {name,email,password}=req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required!"
            })
        }
        const existing=await authService.findUserByEmail(email);
        if(existing){
            return res.status(409).json({
                success:false,
                message:"Email already exists"
            })
        }
        await authService.createUser(name,email,password)
        res.status(201).json({
                    success:true,
                    message:"User registered successfully"
                });
    }
    catch(err){
        next(err)
    }
}

async function login(req,res,next) {
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }
        const user=await authService.findUserByEmail(email);
        if(!user){
            return res.status(401).json({
                success:false,  
                errorCode: "AUTH_INVALID_CREDENTIALS",
                message:"Invalid email or password!"
            })
        }
        const isMatch=await authService.validatePassword(password,user.password)
        if(!isMatch){
            return res.status(401).json({
                success:false,
                errorCode: "AUTH_INVALID_CREDENTIALS",
                message:"Invalid email or password!"
            })
        }
        const accessToken=await tokenService.generateAccessToken(user.id)
        const refreshToken=await tokenService.generateRefreshToken(user.id)
        await tokenService.saveRefreshToken(user.id,refreshToken)
        res.cookie("refreshToken",refreshToken,{
            httpOnly:true, //js cannot access it
            secure:false, //cookie works on http,if production then works on https only
            sameSite:"strict", //prevents cross site request forgery(CSRF)
            maxAge:7*24*60*60*1000
        })
        res.status(200).json({
            success:true,
            message:"Login successful!",
            accessToken:accessToken,
        })
    }
    catch(err){
        next(err)
    }
}

async function refresh(req,res,next) {
    try{
        const refreshToken=req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({
                success:false,
                message:"Refresh token required!"
            })
        }
        const tokenInDb=await tokenService.findRefreshToken(refreshToken)
        if (!tokenInDb.length) {
            return res.status(401).json({ success: false, message: "Invalid refresh token!" });
        }
        const decoded=await tokenService.verifyRefreshToken(refreshToken)
        const newAccessToken=await tokenService.generateAccessToken(decoded.userId)
        const newRefreshToken=await tokenService.generateRefreshToken(decoded.userId)
        await tokenService.rotateRefreshToken(refreshToken,newRefreshToken)
        res.cookie("refreshToken",newRefreshToken,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })
        res.status(200).json({
            success:true,
            accessToken:newAccessToken
        })
    }
    catch(err){
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
        }
        next(err);
    }
}

async function logout(req,res,next) {
    try{
        const refreshToken= req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(400).json({
                success:false,
                message:"Refresh token required!"
            })
        }
        await tokenService.deleteRefreshToken(refreshToken)
        res.clearCookie("refreshToken",{
            httpOnly:true,
            secure:false,
            sameSite:"strict"
        })
        res.status(200).json({
            success:true,
            message:"Logout successful!"
        })
    }
    catch(err){
        next(err)
    }
}

module.exports={register,login,refresh,logout}