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

  // ✅ Start countdown only when orderData is set (success case)
  useEffect(() => {
    if (orderData && !error) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/user/orders");
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [orderData, error, router]);

  const goToOrders = () => router.push("/user/orders");

  if (loading)
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <p>Processing your payment, please wait...</p>
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
      <div
        className="bg-white shadow rounded-circle d-flex justify-content-center align-items-center mb-4"
        style={{ width: "100px", height: "100px" }}
      >
        <i
          className="bi bi-check2-circle text-success"
          style={{ fontSize: "3rem" }}
        ></i>
      </div>

      <h4 className="text-success fw-bold mb-2">Payment Successful!</h4>
      <p className="text-muted mb-4">
        Thank you for your purchase. Redirecting you to your orders in{" "}
        <strong>{countdown} seconds...</strong>
      </p>

      <button
        className="btn btn-primary px-4 py-2 shadow rounded-pill"
        onClick={goToOrders}
      >
        Back to Orders
      </button>
    </div>
  );
}
