'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AlertService from "@/app/components/alertService";

export default function PaymentSuccessClient() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying payment session...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSuccess = async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");

      if (!sessionId) {
        AlertService.error("Missing payment session ID");
        router.push("/");
        return;
      }

      const signupData = JSON.parse(sessionStorage.getItem("registerData") || "{}");
      const selectedPlan = JSON.parse(sessionStorage.getItem("selectedPlan") || "{}");

      try {
        setStatus("Saving transaction...");
        const transRes = await axios.post(
          `/api/membership-transaction`,
          { sessionId },
          { withCredentials: true } // ✅ sends cookie automatically
        );

        if (!transRes.data) throw new Error(transRes.data.error || "Transaction save failed");

        setStatus("Finalizing registration...");
        const registerRes = await axios.post(
          `/api/auth/register`,
          { ...signupData, membershipId: selectedPlan._id },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );

        if (!registerRes.data) throw new Error(registerRes.data.error || "Registration failed");

        AlertService.success("Payment & registration completed successfully!");

        // Clear session data
        sessionStorage.removeItem("registerData");
        sessionStorage.removeItem("selectedPlan");
        sessionStorage.removeItem("stripeSessionId");

        setTimeout(() => router.push("/login"), 2000);

      } catch (err) {
        console.error(err);
        AlertService.error(err.message || "Payment/registration failed");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    handleSuccess();
  }, [router]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="card shadow-sm border-0 p-5 text-center"
        style={{ maxWidth: 400 }}
      >
        {loading ? (
          <>
            <div
              className="spinner-border text-primary mb-3"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            />
            <h5 className="text-primary">{status}</h5>
            <p className="text-muted small">
              Please wait, this may take a few seconds...
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "3rem", color: "green" }}>✅</div>
            <h5 className="mt-3 text-success">All done!</h5>
            <p className="text-muted">You will be redirected shortly.</p>
          </>
        )}
      </div>
    </div>
  );
}
