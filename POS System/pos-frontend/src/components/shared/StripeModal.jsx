import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { removeAllItems } from "../../redux/slices/cartSlice"; 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      enqueueSnackbar(error.message, { variant: "error" });
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      enqueueSnackbar("Payment Successful!", { variant: "success" });
      dispatch(removeAllItems());
      onClose();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement className="text-white" />
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 py-3 bg-[#2a2a2a] text-white rounded-lg font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-1/2 py-3 bg-[#f6b100] text-black rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </form>
  );
};

const StripeModal = ({ clientSecret, onClose }) => {
  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#f6b100",
      colorBackground: "#1f1f1f",
      colorText: "#ffffff",
    },
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] p-6 rounded-2xl w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Complete Payment</h2>
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <CheckoutForm onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
};

export default StripeModal;