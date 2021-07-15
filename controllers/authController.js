const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const createJWT = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'90d'});
}


// /api/auth/signup => POST
// body: {email,password,confirmPassword,username}

exports.signup = catchAsync( async (req,res,next) => {
    const {email,password,confirmPassword,username} = req.body;
    if (password !== confirmPassword) {
        return next(new AppError("passwords donot match",400));
    }
    let user = new User({email,password,username});
    const token = user.createVerificationToken();
    await user.save({validateBeforeSave:false});
    const url = `${req.protocol}://${req.get('host')}/api/auth/confirm-email/${user.id}`
    try{
        await sendEmail({
                email:user.email,
                subject:"your email confirmation token valid for 30 minutes",
                message:`To confirm your email make a patch request to ${url} with the this token in the body ${token}`
                });
        res.status(201).json({status:"success",message:"Your Account has been created confirm your email address by token we sent you"});
    }catch(e){
        res.status(500).json({status:"error",message:"failed to send email"});
    }
});

exports.emailVerification = catchAsync( async (req,res,next) => {
    // hashing the token
    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    // getting user by id from parameters
    const user = await User.findOne({_id:req.params.userId}).select("+active");
    // check if user exist
    if (!user){
        return next(new AppError("user not found",404));
    }
    // checking the verification token if its correct 
    if (user.verificationToken !== hashedToken){
        return next(new AppError("Invalid token ",400));
    }
    // check if token still valid
    if(!(user.isVerificationTokenStillValid())){
        return next(new AppError(new AppError("Token Expired",400)));
    }
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.active = true;
    await user.save({validateBeforeSave:false});
    // login the user
    const token = createJWT(user.id);
    res.status(200).json({
        status:"success",
        token,
        data:{
            user
        }
    });
});

// /api/auth/login => POST
// body: {username,password}

exports.login = catchAsync( async (req,res,next) => {
    const {email,password} = req.body;
    if (!email || !password){
        // please provide email and password
        return next(new AppError("please provide email and password",400));
    }
    const user = await User.findOne({email}).select("+password");;
    if(!user || !(await user.isPasswordCorrect(password,user.password))){
        return next(new AppError("Please provide correct email and password",400));
    }
    const token = createJWT(user.id);
    res.status(200).json({
        status:"success",
        token,
        data:{
            user
        }
    });
});

// middleware for protecting routes

exports.protect = () => {}


// middleware for restricting access to certain users

exports.restrictTo = () => {}

// /api/auth/forgot-password => POST
// body: {email}
exports.forgotPassword = () => {}


// api/auth/reset-password => PATCH
// body: {currentPassword,newPassword,confirmPassword}
exports.resetPassword = () => {}


// api/auth/update-password => PATCH
// body: {currentPassword,newPassword}

exports.updatePassword = () => {}




