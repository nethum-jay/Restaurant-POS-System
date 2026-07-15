const Razorpay = require("razorpay");

const createOrder = async (req, res, next) => {

    const razorpay = new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpaySecretKey,
    });

}


module.exports = { createOrder };