// handles all JWT + DB token logic

const jwt=require("jsonwebtoken");
const db=require("../config/db")

function generateAccessToken(userId){
    return jwt.sign(
                {userId:userId}, 
                process.env.JWT_SECRET, 
                {expiresIn:"15m"}
            );
}

function generateRefreshToken(userId){
    return jwt.sign(
                {userId:userId},
                process.env.JWT_REFRESH_SECRET,
                {expiresIn:"7d"}
            );
}

function saveRefreshToken(userId,token){
    return new Promise((resolve,reject)=>{
        db.query("insert into refresh_tokens(user_id,token) values(?,?);",[userId,token],(err,result)=>
            (err?reject(err):resolve(result))
        )
    })
}

function findRefreshToken(token){
    return new Promise((resolve,reject)=>{
        db.query("select * from refresh_tokens where token = ?",[token],(err, results) => 
            (err ? reject(err) : resolve(results))
        );
    })
}

function rotateRefreshToken(oldToken,newToken){
    return new Promise((resolve,reject)=>{
        db.query("update refresh_tokens set token = ? where token = ?",[newToken, oldToken],(err, result) => 
            (err ? reject(err) : resolve(result))
        );
    })
}

function deleteRefreshToken(token){
    return new Promise((resolve, reject) => {
    db.query("DELETE FROM refresh_tokens WHERE token = ?",[token],(err, result) => 
        (err ? reject(err) : resolve(result))
    );
  });
}

function verifyRefreshToken(token){
    return jwt.verify(token,process.env.JWT_REFRESH_SECRET);
}

module.exports={generateAccessToken,generateRefreshToken,saveRefreshToken,findRefreshToken,rotateRefreshToken,deleteRefreshToken,verifyRefreshToken,}