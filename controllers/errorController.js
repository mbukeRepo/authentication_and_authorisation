const AppError = require("../utils/AppError");

const handleCastErrorDB = err => {
    let message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message,400);
}


const sendErrorDev = (err,res) => {
    return res.status(err.statusCode).json({
        status:err.status,
        message: err.message,
        error:err
    });
}

const sendErrorProd = (err,res) => {
    if(err.isOperational){
        return res.status(err.statusCode).json({status:err.status,message:err.message});
    }else{
        err.status = "error";
        err.statusCode = 500;
        console.log("Error",err.stack);
        return res.status(err.statusCode).json({
            status:err.status,
            message:"something went wrong try again ..."
        })
    }
}

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV == "development"){
        sendErrorDev(err,res);
    }else{
        let error = err;
        // handling other common errors and marking them as operational 

        // 1) cast Error - bad objectid
        if(err.name == "CastError"){
            error = handleCastErrorDB(err);
        }
        // 2) validation errors
        
        sendErrorProd(error,res);
    }
}