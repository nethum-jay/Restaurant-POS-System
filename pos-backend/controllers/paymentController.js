// const Stripe = require("stripe");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 
// const config = require("../config/config");
// const crypto = require("crypto");

// const createOrder = async (req, res, next) => {
//     try {
//         const { amount } = req.body;
//         const options = {
//             amount: amount * 100, // Amount in paisa (1 LKR = 100 paisa)
//             currency: "lkr", 
//             metadata: {
//                 receipt: `receipt_${Date.now()}` 
//             }
//         };

//         const paymentIntent = await stripe.paymentIntents.create(options);
//         res.status(200).json({
//             success: true, 
//             clientSecret: paymentIntent.client_secret 
//         });
//     } catch (error) {
//         next(error); 
//     }
// };

// const verifyPayment = async (req, res, next) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = 
//             req.body;

//         const expectedSignature = crypto
//             .createHmac("sha256", config.razorpaySecretKey)
//             .update(razorpay_order_id + "" + razorpay_payment_id)
//             .digest("hex");

//         if (expectedSignature === razorpay_signature) {
//             res.json({ success: true, message: "Payment verified successfully!" });
//         } else {
//             const error = creatHttpError(400, "Payment verification failed!");
//             return next(error);
//         }
//     } catch (error) {
//         next(error);
//     }
// };

// const webHookVerification = async (req, res, next) => {

//     try {
//         const secret = config.razorpyWebhookSecret;
//         const signature = req.headers["x-razorpay-signature"];

//         const body = JSON.stringify(req.body);

//         // 🛑 Verify the signature
//         const expectedSignature = crypto
//         .createHmac("sha256", secret)
//         .update(body)
//         .digest("hex");

//         if (expectedSignature === signature) {
//             console.log("✅ Webhook verified:", req.body);

//             // ✅ Process payment (e.g., update DB, send confirmation email)
//             if (req.body.event === "payment.captured") {
//                 const payment = req.body.payload.payment.entity;
//                 console.log(`💰 Payment Captured: ${payment.amount / 100} INR`);

//                 // Add Payment Details in Database
//                 const newPayment = new Payment({
//                     paymentId: payment.id,
//                     orderId: payment.order_id,
//                     amount: payment.amount / 100,
//                     currency: payment.currency,
//                     status: payment.status,
//                     method: payment.method,
//                     email: payment.email,
//                     contact: payment.contact,
//                     createdAt: new Date(payment.created_at * 1000)
//                 })

//                 await newPayment.save();
//             }

//             res.json({ success: true });
//         } else {
//             const error = createHttpError(400, "❌ Invalid Signature!");
//             return next(error);
//         }
//     } catch (error) {
//         next(error);
//     }
// };

// module.exports = { createOrder, verifyPayment, webHookVerification};



const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/paymentModel");

const createOrder = async (req, res, next) => {
    try {
        const { amount, currency } = req.body;

        const options = {
            amount: Number(amount), 
            currency: currency || "usd", 
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
        res.status(200).json({ success: true, message: "Payment verified successfully!" });
    } catch (error) {
        next(error);
    }
};

const webHookVerification = async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret && sig) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            event = req.body;
        }

        console.log("✅ Webhook verified:", event.type || "Event received");

        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            console.log(`💰 Payment Captured: ${paymentIntent.amount / 100} ${(paymentIntent.currency || "USD").toUpperCase()}`);

            const newPayment = new Payment({
                paymentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                method: paymentIntent.payment_method_types ? paymentIntent.payment_method_types[0] : "card",
                createdAt: new Date(paymentIntent.created * 1000)
            });

            await newPayment.save();
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.log("Webhook Error:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
};

module.exports = { createOrder, verifyPayment, webHookVerification };