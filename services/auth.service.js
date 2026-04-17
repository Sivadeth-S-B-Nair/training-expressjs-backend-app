// register/login business logic

const bcrypt=require("bcryptjs");
const db=require("../config/db");

function findUserByEmail(email){
    return new Promise((resolve,reject)=>{
        db.query("select * from users where email=?;",[email],(err,results)=>
            (err? reject(err):resolve(results[0] || null))
        )
    })
}

async function createUser(name,email,password) {
    const hashedPassword= await bcrypt.hash(password,10);
    return new Promise((resolve,reject)=>{
        db.query("insert into users(name,email,password) values(?,?,?);",[name, email, hashedPassword],(err, result) => 
            (err ? reject(err) : resolve(result)))
    }) 
}

async function validatePassword(password,hashedPassword) {
    return await bcrypt.compare(password,hashedPassword);
}


module.exports={findUserByEmail, createUser, validatePassword}