const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required:[true, "email is required for creating a account"],
        trim: true,
        lowercase:true,
        match:[ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"],
        unique: true
    },

    name:{
        type: String,
        required:[true, "Name is required for creating a account"]

    },

    password:{
        type: String,
        required:[true, "Password is required for creating a account"],
        minlength:[6,"Password should contain minimum 6 characters"],
        select:false
    },

    systemUser:{
        type:Boolean,
        default:false,
        select:false,
        immutable:true
    }
},{
    timestamps:true
});


userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return
    }

    const hash = await bcrypt.hash(this.password,10);
    this.password = hash;

    return


})

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema);

module.exports = userModel;