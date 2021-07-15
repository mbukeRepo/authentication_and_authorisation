const express = require('express');
const {login,signup,protect,forgotPassword,resetPassword,updatePassword, emailVerification} = require('../controllers/authController');
const {deleteMe,updateMe} =  require('../controllers/userController');
const router = express.Router();

router.post('/login',login);
router.post('/signup',signup);
router.post('/forgot-password',forgotPassword);

router.patch('/reset-password',resetPassword);
router.patch('/update-password',protect,updatePassword);
router.patch('/activate-account/:userId',emailVerification);

router.patch('/update-me',protect,updateMe);

module.exports = router;