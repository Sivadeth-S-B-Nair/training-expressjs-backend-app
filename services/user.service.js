//user data queries

const db=require("../config/db");

function findUserById(id){
    return new Promise((resolve,reject)=>{
        db.query("select id,name,email from users where id=?;",[id],(err,results)=>
            (err?reject(err):resolve(results[0] || null))
        )
    })
}

module.exports={findUserById}