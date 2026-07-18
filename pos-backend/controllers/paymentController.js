const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 

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

module.exports = { createOrder };