// import React, { useState } from "react";
// import { connect, useSelector } from "react-redux";
// import { getTotalPrice } from "../../redux/slices/cartSlice";
// import { createStripePayment, verifyPaymentRazorpay } from "../../https/index";
// import { enqueueSnackbar } from "notistack";

// function loadScript(src) {
//     return new Promise((resolve) => {
//         const script = document.createElement("script");
//         script.src = src;
//         script.onload = () => {
//             resolve(true);
//         };
//         script.onerror = () => {
//             resolve(false);
//         };
//         document.body.appendChild(script);
//     });
// }

// const Bill = () => {
//     const customerData = useSelector((state) => state.customer);
//     const carData = useSelector(state => state.cart);
//     const total = useSelector(getTotalPrice);
//     const taxRate = 5.25;
//     const tax = (total * taxRate) / 100;
//     const totalPriceWithTax = total + tax;

//     const [paymentMethod, setPaymentMethod] = useState();

//     const handlePlaceOrder = async () => {
//         if(!paymentMethod) {
//             enqueueSnackbar("Please select a payment method!", { 
//                 variant: "warning"
//             });

//             return;
//         }

//         // load the script 
//         try {
//             const res = await loadScript(
//                 "https://checkout.razorpay.com/v1/checkout.js"
//             );

//             if (!res) {
//                 enqueueSnackbar("Razorpay SDK failed to load. Are you online?", {
//                     variant: "warning",
//                 });
//                 return;
//             }

//             // create order

//             const reqData = {
//                 amount: totalPriceWithTax.toFixed(2)
//             }

//             const { data } = await createStripePayment(reqData);

//             const options = {
//                 key: `${import.meta.env.VITE_RAZORPAY_KEY_ID}`,
//                 amount: data.order.amount,
//                 currency: data.order.currency,
//                 name: "RESTRO",
//                 description: "Secure Payment for Your Meal",
//                 order_id: data.order.id,
//                 handler: async function (response) {
//                     const verification = await verifyPaymentRazorpay(response);
//                     console.log(verification);
//                     enqueueSnackbar(verification.data.message, { variant: "success" });
//                 },
//                 prefill: {
//                     name: customerData.name,
//                     email:"",
//                     contact: customerData.phone,
//                 },
//                 theme: { color: "#022cca" },
//             };

//             const rzp = new window.Rozorpay(options);
//             rzp.open();
//         } catch (error) {
//             console.log(error);
//             enqueueSnackbar("Payment Failed", { 
//                 variant: "error",
//             });
//         }
//     };

//   return (
//     <>
//         <div className="flex items-center justify-between px-5 mt-2">
//             <p className="text-xs text-[#ababab] font-medium mt-2">Items({carData.length})</p>
//             <h1 className="text-[#f5f5f5] text-md font-bold">Rs.{total.toFixed(2)}</h1>
//         </div>
//         <div className="flex items-center justify-between px-5 mt-2">
//             <p className="text-xs text-[#ababab] font-medium mt-2">Tax(5.25%)</p>
//             <h1 className="text-[#f5f5f5] text-md font-bold">Rs.{tax.toFixed(2)}</h1>
//         </div>
//         <div className="flex items-center justify-between px-5 mt-2">
//             <p className="text-xs text-[#ababab] font-medium mt-2">Total With Tax</p>
//             <h1 className="text-[#f5f5f5] text-md font-bold">Rs.{totalPriceWithTax.toFixed(2)}</h1>
//         </div>
//         <div className="flex items-center gap-3 px-5 mt-4">
//             <button onClick={() => setPaymentMethod("Cash")} className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${paymentMethod === "Cash" ? "bg-[#383737]" : ""}`}>Cash</button>
//             <button onClick={() => setPaymentMethod("Online")} className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${paymentMethod === "Online" ? "bg-[#383737]" : ""}`}>Online</button>
//         </div>

//         <div className="flex items-center gap-3 px-5 mt-4">
//             <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg">Print Receipt</button>
//             <button onClick={handlePlaceOrder} className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg">Place Order</button>
//         </div>
//     </>

//   );
// };

// export default Bill;



import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import { createStripePayment, addOrder, updateTable } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import StripeModal from "../shared/StripeModal";

const Bill = () => {
    const dispatch = useDispatch();

    const customerData = useSelector((state) => state.customer);
    const cartData = useSelector((state) => state.cart);
    const total = useSelector(getTotalPrice);
    const taxRate = 5.25;
    const tax = (total * taxRate) / 100;
    const totalPriceWithTax = total + tax;

    const [paymentMethod, setPaymentMethod] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [openStripeModal, setOpenStripeModal] = useState(false);

    // 1. The mutation for saving the order to the database
    const orderMutation = useMutation({
        mutationFn: (reqData) => addOrder(reqData),
        onSuccess: (resData) => {
            const { data } = resData.data;
            console.log("Order Created:", data);

            // 2. Updating the table status to "Booked" after the order is created
            const tableData = {
                status: "Booked",
                orderId: data._id,
                tableId: data.table
            };

            setTimeout(() => {
                tableUpdateMutation.mutate(tableData);
            }, 1500);

            enqueueSnackbar("Order Placed!", {
                variant: "success"
            });
        },
        onError: (error) => {
            console.log("Order Error:", error);
            enqueueSnackbar("Failed to place order!", { variant: "error" });
        }
    });

    // 3. Resetting the customer and the cart after updating the table
    const tableUpdateMutation = useMutation({
        mutationFn: (reqData) => updateTable(reqData),
        onSuccess: (resData) => {
            console.log("Table Updated:", resData);
            dispatch(removeCustomer());
            dispatch(removeAllItems());
        },
        onError: (error) => {
            console.log("Table Update Error:", error);
        }
    });

    // Function that saves the order after a successful Stripe payment
    const handleOnlinePaymentSuccess = (paymentIntent) => {
        const orderData = {
            customerDetails: {
                name: customerData.customerName,
                phone: customerData.customerPhone,
                guests: customerData.guests
            },
            orderStatus: "In Progress",
            bills: {
                total: total,
                tax: tax,
                totalWithTax: totalPriceWithTax
            },
            items: cartData,
            table: customerData.table?.tableId,
            paymentMethod: paymentMethod,
            paymentData: {
                stripe_payment_id: paymentIntent.id,
                stripe_payment_status: paymentIntent.status
            }
        };

        setTimeout(() => {
            orderMutation.mutate(orderData);
        }, 1500);
    };

    const handlePlaceOrder = async () => {
        if (!paymentMethod) {
            enqueueSnackbar("Please select a payment method!", {
                variant: "warning"
            });
            return;
        }

        if (cartData.length === 0) {
            enqueueSnackbar("Cart is empty!", { variant: "warning" });
            return;
        }

        // Saving the order directly when making a cash payment
        if (paymentMethod === "Cash") {
            const orderData = {
                customerDetails: {
                    name: customerData.customerName,
                    phone: customerData.customerPhone,
                    guests: customerData.guests
                },
                orderStatus: "In Progress",
                bills: {
                    total: total,
                    tax: tax,
                    totalWithTax: totalPriceWithTax
                },
                items: cartData,
                table: customerData.table?.tableId,
                paymentMethod: paymentMethod
            };

            setTimeout(() => {
                orderMutation.mutate(orderData);
            }, 1500);
            return;
        }

        // Opening the Stripe modal when making payments via the online (Stripe) method
        if (paymentMethod === "Online") {
            try {
                const reqData = {
                    amount: totalPriceWithTax.toFixed(2),
                    currency: "lkr",
                    email: customerData?.customerEmail || "customer@pos.com",
                    contact: customerData?.customerPhone || "+94771234567",
                    customer: customerData
                };

                const { data } = await createStripePayment(reqData);
                const secret = data?.clientSecret || data?.client_secret;

                if (secret) {
                    setClientSecret(secret);
                    setOpenStripeModal(true);
                } else {
                    enqueueSnackbar("Failed to initialize Stripe payment", { variant: "error" });
                }
            } catch (error) {
                console.log("Stripe Payment Error:", error);
                enqueueSnackbar("Payment Failed to initiate", {
                    variant: "error"
                });
            }
        }
    };

    return (
        <>
            <div className="flex items-center justify-between px-5 mt-2">
                <p className="text-xs text-[#ababab] font-medium mt-2">Items({cartData.length})</p>
                <h1 className="text-[#f5f5f5] text-md font-bold">Rs.{total.toFixed(2)}</h1>
            </div>
            <div className="flex items-center justify-between px-5 mt-2">
                <p className="text-xs text-[#ababab] font-medium mt-2">Tax(5.25%)</p>
                <h1 className="text-[#f5f5f5] text-md font-bold">Rs.{tax.toFixed(2)}</h1>
            </div>
            <div className="flex items-center justify-between px-5 mt-2">
                <p className="text-xs text-[#ababab] font-medium mt-2">Total With Tax</p>
                <h1 className="text-[#f5f5f5] text-md font-bold">Rs.{totalPriceWithTax.toFixed(2)}</h1>
            </div>

            <div className="flex items-center gap-3 px-5 mt-4">
                <button
                    onClick={() => setPaymentMethod("Cash")}
                    className={`px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${paymentMethod === "Cash" ? "bg-[#383737] text-white" : "bg-[#1f1f1f]"}`}
                >
                    Cash
                </button>
                <button
                    onClick={() => setPaymentMethod("Online")}
                    className={`px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${paymentMethod === "Online" ? "bg-[#383737] text-white" : "bg-[#1f1f1f]"}`}
                >
                    Online
                </button>
            </div>

            <div className="flex items-center gap-3 px-5 mt-4">
                <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg">
                    Print Receipt
                </button>
                <button
                    onClick={handlePlaceOrder}
                    className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg"
                >
                    Place Order
                </button>
            </div>

            {openStripeModal && clientSecret && (
                <StripeModal
                    clientSecret={clientSecret}
                    onClose={() => setOpenStripeModal(false)}
                    onPaymentSuccess={handleOnlinePaymentSuccess}
                />
            )}
        </>
    );
};

export default Bill;