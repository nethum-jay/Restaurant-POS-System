const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 
const config = require("../config/config");
const crypto = require("crypto");

const createOrder = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // Amount in paisa (1 LKR = 100 paisa)
            currency: "lkr", 
            metadata: {
                receipt: `receipt_${Date.now()}` 
            }
        };

        const paymentIntent = await stripe.paymentIntents.create(options);
        res.status(200).json({
            success: true, 
            clientSecret: paymentIntent.client_secret 
        });
    } catch (error) {
        next(error); 
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = 
            req.body;

        const expectedSignature = crypto
            .createHmac("sha256", config.razorpaySecretKey)
            .update(razorpay_order_id + "" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, message: "Payment verified successfully!" });
        } else {
            const error = creatHttpError(400, "Payment verification failed!");
            return next(error);
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, verifyPayment };