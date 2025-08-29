"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useOrderStore } from "@/app/store/orderStore";
import { useCartStore } from "@/app/store/cartStore";
import axios from "axios";
import AlertService from "@/app/components/alertService";
const CardPayment = () => {
  const { clearCart } = useCartStore();
  const router = useRouter();
  const { billing, shipping, clearOrder } = useOrderStore();
  const [orderSummary, setOrderSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardholdername: "",
    cardnumber: "",
    expiry: "",
    cvv: "",
  });

  // console.log("Billing Info:", billing);
  // console.log("Shipping Info:", shipping);
  // if (!billing || !shipping) return null;

  const fetchOrderSummary = async () => {
    try {
      const orderSumm = await axios.post("/api/order-summary");

      setOrderSummary(orderSumm.data.summary);
      // console.log(orderSummary);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

useEffect(() => {
  if (!billing || !shipping) {
    router.replace("/checkout"); // use replace to prevent back-button loop
  } else {
    fetchOrderSummary();
  }
}, []); // run only once on mount


  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      const transformedBilling = {
        fullName: `${billing.firstName} ${billing.lastName}`,
        address: billing.address,
        city: billing.city,
        state: billing.state,
        zip: billing.pincode,
        phone: billing.phone,
        email: billing.email,
      };

      const transformedShipping = {
        fullName: `${shipping.firstName} ${shipping.lastName}`,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.pincode,
        phone: shipping.phone,
        email: billing.email,
      };

      const payload = {
        billing: transformedBilling,
        shipping: transformedShipping,
        paymentMethod: "card",
      };

      const response = await axios.post("/api/checkout", payload);

      if (response) {
        AlertService.success(response.data.message);
        clearCart(); // clear order from Zustand

        clearOrder();
        router.push("/user/orders");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); // ✅ stop loader
    }
    // router.push("/thank-you"); // or order summary page
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cardholdername" && /[^a-zA-Z\s-]/.test(value)) return;
    if (name === "cardnumber" && !/^\d{0,16}$/.test(value.replace(/\s/g, "")))
      return;
    if (name === "cvv" && !/^\d{0,4}$/.test(value)) return;
    if (name === "expiry" && !/^\d{0,5}$/.test(value.replace("/", ""))) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <>
      <Header />
      <OtherBanner
        page_title="Card Payment"
        banner_image="/assets/images/bg/furniture_banner.jpg"
      />
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="fw-bold mb-4 text-center">Secure Card Payment</h2>
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="bg-white p-4 shadow rounded-4">
                <form onSubmit={handlePayment}>
                  <div className="mb-3">
                    <label className="form-label">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardholdername"
                      value={formData.cardholdername}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      name="cardnumber"
                      value={formData.cardnumber}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="•••"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 border-top pt-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Amount</span>
                      <span className="fw-bold">
                        ${orderSummary.totalAmount}
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-danger w-100 fw-semibold py-2 rounded-pill mt-2"
                      disabled={isLoading} // ✅ disable when loading
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        "Pay Now"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default CardPayment;
