const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        select:false,
        minLength:[8,"password should be eight characters and above"]
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpiry:Date,
    active:{
        type:Boolean,
        default:false,
        select:false
    },
    verificationToken:String,
    verificationTokenExpiry:Date
});


// middleware
// creating a document at first 
// password is modified so .isModified() returns false
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});



// object methods
userSchema.methods.createVerificationToken = function(){
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.verificationTokenExpiry = Date.now() + 30 * 60 * 1000;
    return token;
}
userSchema.methods.isVerificationTokenStillValid = function(){
    return Date.now() < this.verificationTokenExpiry;
}
userSchema.methods.isPasswordCorrect = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}
module.exports = mongoose.model('user',userSchema);