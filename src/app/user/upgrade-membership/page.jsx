"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Sidebar from "@/app/components/Sidebar";
import OtherBanner from "@/app/components/OtherBanner";
import Loader from "@/app/components/Loader";
import axios from "axios";
import AlertService from "@/app/components/alertService";
export default function UpgradeMembershipPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [currencyName, setCurrencyName] = useState("");

  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND;
  // ✅ Fetch Stripe key dynamically
  const fetchStripeKey = async () => {
    try {
      const res = await axios.get("/api/get-stripeKey", {
        withCredentials: true, // ✅ send cookies
      });

      if (res.data?.publishable_key) {
        setStripePromise(loadStripe(res.data.publishable_key));
      } else {
        AlertService.error(res.data?.message || "Failed to fetch Stripe key");
      }
    } catch (err) {
      AlertService.error("Unable to load Stripe key");
    }
  };

  useEffect(() => {
    fetchStripeKey();
  }, []);

  // Map plan colors/gradients dynamically
  const planStyles = [
    {
      gradient: "linear-gradient(135deg, #031127ff, #073246ff)",
      color: "secondary",
    },
    {
      gradient: "linear-gradient(135deg, #30a3acff, #0b6880ff)",
      color: "primary",
    },
    {
      gradient: "linear-gradient(135deg, #aa891bff, #b3990bff)",
      color: "success",
    },
    {
      gradient: "linear-gradient(135deg, #d4145aff, #fbb03bff)",
      color: "warning",
    },
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get("/api/membership/my-plan", {
          withCredentials: true, // ✅ send cookies
        });

        if (res.data.success) {
          const styledPlans = res.data.data.plans.map((plan, index) => ({
            ...plan,
            gradient: planStyles[index % planStyles.length].gradient,
            color: planStyles[index % planStyles.length].color,
          }));

          setPlans(styledPlans);
          setCurrentPlanId(res.data.data.userPlanId);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleUpgrade = async (plan, currencyName) => {
    if (plan._id === currentPlanId) {
      alert("You are already subscribed to this membership.");
      return;
    }

    try {
      setLoadingPlanId(plan._id);

      const stripe = await stripePromise;

      const cartItems = [{ title: plan.name, price: plan.price, quantity: 1 }];

      const successUrl = `${FRONTEND_URL}/user/membership-success?plan=${plan._id}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${FRONTEND_URL}/user/upgrade-membership`;

      // ✅ axios POST with cookies
      const res = await axios.post(
        "/api/membership-payment",
        { cartItems, successUrl, cancelUrl, currencyName },
        { withCredentials: true }
      );

      if (res.data?.url) {
        window.location.href = res.data.url; // redirect to Stripe Checkout
      } else {
        alert("Could not create payment session. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingPlanId(null); // ✅ reset loader
    }
  };

  return (
    <>
      <Header />
      <OtherBanner page_title="Upgrade Membership" />

      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <Sidebar showLoader={false} />

            {initialLoading ? (
              <div
                className="profile-info col-md-9 d-flex justify-content-center align-items-center"
                style={{ minHeight: "300px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="profile-info col-md-9">
                <div className="tm-form tm-login-form tm-form-bordered form-card">
                  <h4 className="text-center fw-bold text-decoration-underline mb-4 ">
                    Upgrade Membership
                  </h4>

                  <div className="row g-4">
                    {plans.map((plan) => {
                      const isCurrent = plan._id === currentPlanId;
                      return (
                        <div key={plan._id} className="col-md-6 col-lg-6">
                          <div
                            className={`card h-100 shadow-lg border-0 plan-card ${
                              isCurrent ? "current-plan-card" : ""
                            }`}
                            style={{
                              borderRadius: "1.5rem", // ⬅️ increased from 1rem
                              transition: "transform 0.3s ease",
                            }}
                          >
                            {isCurrent && (
                              <div
                                className="position-absolute top-0 start-50 translate-middle badge px-3 py-2 rounded-pill shadow text-white"
                                style={{ backgroundColor: "#319944" }}
                              >
                                Your Current Plan
                              </div>
                            )}

                            <div
                              className="p-4 text-white text-center rounded-top"
                              style={{
                                background: plan.gradient,
                                borderTopLeftRadius: "1rem",
                                borderTopRightRadius: "1rem",
                              }}
                            >
                              <h4 className="fw-bold mb-1 text-white">
                                {plan.name}
                              </h4>
                              <h3 className="fw-bold text-white">
                                {plan.price === 0
                                  ? "Free"
                                  : `${plan.currency}${plan.price} / ${plan.durationInDays} days`}
                              </h3>
                            </div>

                            <div className="card-body d-flex flex-column">
                              <ul className="list-unstyled mb-4 mt-3">
                                <li className="mb-2 d-flex justify-content-between">
                                  <span className="d-flex align-items-center">
                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                    Buy/Sell Limit:
                                  </span>
                                  <span>{plan.limits.buySell}</span>
                                </li>

                                <li className="mb-2 d-flex justify-content-between">
                                  <span className="d-flex align-items-center">
                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                    Rent/Lease Limit:
                                  </span>
                                  <span>{plan.limits.rentLease}</span>
                                </li>

                                <li className="mb-2 d-flex justify-content-between">
                                  <span className="d-flex align-items-center">
                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                    Marketplace Limit:
                                  </span>
                                  <span>{plan.limits.marketplace}</span>
                                </li>
                              </ul>

                              <button
                                className={`btn mt-auto rounded-pill ${
                                  isCurrent
                                    ? "btn-outline-secondary"
                                    : `btn-${plan.color}`
                                }`}
                                disabled={
                                  isCurrent || loadingPlanId === plan._id
                                }
                                onClick={() =>
                                  handleUpgrade(plan, plan.currencyName)
                                }
                              >
                                {loadingPlanId === plan._id ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-2"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                    Processing...
                                  </>
                                ) : isCurrent ? (
                                  "Current Plan"
                                ) : (
                                  "Upgrade Now"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .plan-card:hover {
          transform: translateY(-5px);
        }
        .current-plan-card {
          box-shadow: 0 0 25px;
        }
      `}</style>
    </>
  );
}
