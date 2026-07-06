const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
         await mongoose.connect(process.env.MONGO_URI);
         console.log("DB connected successfully");

    }catch(err){
        console.log("Error connecting to DB:",err);
        process.exit(1);

    }

}

module.exports = connectDB;