const mongoose = require('mongoose');

module.exports = async (url) => {
    try {
        await mongoose.connect(url);
        console.log("connected to youtube database");
    } catch (error) {
        console.log("Error connecting to db");
    }
}