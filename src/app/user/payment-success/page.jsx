"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCartStore } from "@/app/store/cartStore";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const saveTransactionAndCheckout = async () => {
      const checkoutData = sessionStorage.getItem("checkoutData");
      const sessionId = new URLSearchParams(window.location.search).get(
        "session_id"
      );

      if (!checkoutData) {
        setError("Missing checkout data. Please return to the checkout page.");
        setLoading(false);
        return;
      }
      if (!sessionId) {
        setError("Missing Stripe session ID.");
        setLoading(false);
        return;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(checkoutData);
      } catch (err) {
        setError("Invalid checkout data.");
        setLoading(false);
        return;
      }

      try {
        // Save transaction
        const { data: transactionData } = await axios.post(
          "/api/transaction",
          { sessionId },
          { withCredentials: true }
        );

        // Save order
        const { data: order } = await axios.post(
          "/api/checkout",
          {
            billing: parsedData.billing,
            shipping: parsedData.shipping,
            paymentMethod: "card",
            transactionId: transactionData._id,
          },
          { withCredentials: true }
        );

        setOrderData(order);
        sessionStorage.removeItem("checkoutData");
        clearCart();
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    saveTransactionAndCheckout();
  }, []);

useEffect(() => {
  if (orderData && !error) {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }
}, [orderData, error]);

// Redirect effect when countdown hits 0
useEffect(() => {
  if (countdown === 0) {
    router.push("/user/orders");
  }
}, [countdown, router]);

  const goToOrders = () => router.push("/user/orders");
if (loading)
  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light text-center">
      <div>
        {/* Spinner */}
        <div
          className="spinner-border text-primary mb-4"
          role="status"
          style={{ width: "3.5rem", height: "3.5rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        {/* Text */}
        <h5 className="fw-bold mb-2">Processing Payment</h5>
        <p className="text-muted mb-0">
          Please wait while we confirm your payment securely...
        </p>
      </div>
    </div>
  );
  if (error)
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light px-4 text-center">
        <h4 className="text-danger fw-bold mb-3">Payment Failed</h4>
        <p className="text-muted mb-4">{error}</p>
        <button
          className="btn btn-primary px-4 py-2 shadow rounded-pill"
          onClick={goToOrders}
        >
          Back to Home
        </button>
      </div>
    );

return (
  <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light text-center px-4">
    {/* Success Icon with Glow */}
    <div
      className="rounded-circle d-flex justify-content-center align-items-center mb-4 shadow-lg"
      style={{
        width: "100px",
        height: "100px",
        background: "linear-gradient(135deg, #28a745, #20c997)",
        boxShadow: "0 0 20px rgba(40,167,69,0.5)",
      }}
    >
      <i
        className="bi bi-check2-circle text-white"
        style={{ fontSize: "3rem", animation: "pulse 1.5s infinite" }}
      ></i>
    </div>

    {/* Headings */}
    <h3 className="text-success fw-bold mb-2">Payment Successful!</h3>
    <p className="text-muted mb-3">
      Thank you for your purchase 🎉<br />
      Redirecting you to your orders in{" "}
      <strong className="text-dark">{countdown} seconds...</strong>
    </p>

    {/* Buttons */}
    <div className="d-flex gap-2">
      <button
        className="btn btn-success px-4 py-2 shadow rounded-pill"
        onClick={goToOrders}
      >
        Go to Orders
      </button>
      <button
        className="btn btn-outline-secondary px-4 py-2 rounded-pill"
        onClick={() => router.push("/")}
      >
        Back to Home
      </button>
    </div>

    {/* Pulse animation */}
    <style jsx>{`
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);
}
