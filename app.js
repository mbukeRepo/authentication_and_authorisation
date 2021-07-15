const express = require('express');
const dotenv = require('dotenv');
const authRouter = require('./routing/userRouter');
const connectDb = require('./utils/connectDB');
const errHandler = require('./controllers/errorController');



const app = express();

dotenv.config({path:'./config.env'});

connectDb(process.env.MONGODB_URL);
// middlewares

app.use(express.json());
app.use('/api/auth',authRouter);
app.all('*',(req,res,next) => {
    res.send("this route is not defined");
});
app.use(errHandler);

app.listen(3000, console.log("app running on port 3000"));