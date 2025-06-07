const { profile, error } = require("console");
const mongoose = require("mongoose");
const { type } = require("os");
const bcrypt = require('bcrypt');
const {createHmac, randomBytes} = require("crypto");
const { createTokenForUser } = require("../services/auth");

const userSchema =  new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
     salt:{
         type:String,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    },
    profileImage:{
        type:String,
        default:"/images/default.png"
    }
}, {timestamps: true}
)

//Method 1 to hash our password
// userSchema.pre('save', async function(next){
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
// })

//Method 2 to hash our password
userSchema.pre("save", function(next){
    const user = this;
    if(!user.isModified("password")) return next();

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
})

userSchema.static("matchPasswordAndGenerateToken", async function(email, password){
    const user = await this.findOne({email});
    if(!user) throw new Error ('User not found');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");

    if(hashedPassword !== userProvidedHash) throw new Error ("Incorrect password");

    const token = createTokenForUser(user);
    return token;
    next();
})

const User = mongoose.model('user', userSchema)

module.exports = User;