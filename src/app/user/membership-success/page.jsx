"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AlertService from "@/app/components/alertService";

export default function MembershipSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planId = params.get("plan");
    const sessionId = params.get("session_id");

    if (!planId || !sessionId) {
      AlertService.error("Missing payment details.");
      router.push("/user/upgrade-membership");
      return;
    }

    (async () => {
      try {
        // Save transaction
        const { data: savedData } = await axios.post(
          `/api/membership-transaction`,
          { sessionId },
          { withCredentials: true }
        );
        if (!savedData?._id) throw new Error("Transaction save failed");

        // Upgrade plan
        const { data: upgradeData } = await axios.post(
          `/api/membership/upgrade-plan`,
          { planId },
          { withCredentials: true }
        );
        if (!upgradeData?.success) throw new Error("Plan upgrade failed");

        AlertService.success("Membership upgraded successfully!");
        setCountdown(10); // start countdown
      } catch (error) {
        AlertService.error(error.response?.data?.error || error.message);
        router.push("/user/upgrade-membership");
      }
    })();
  }, [router]);

  // ⏳ countdown effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      router.push("/user/upgrade-membership");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 text-center" style={{ maxWidth: 450 }}>
        {countdown === null ? (
          <>
            <div className="spinner-border text-primary mb-3 mx-auto d-block" role="status" />
            <h4 className="fw-bold">Processing your membership...</h4>
            <p className="text-muted">Please wait while we confirm your payment.</p>
          </>
        ) : (
          <>
            <div
              className="rounded-circle bg-success d-flex justify-content-center align-items-center mx-auto mb-3"
              style={{ width: 80, height: 80 }}
            >
              <i className="bi bi-check-lg text-white fs-2"></i>
            </div>
            <h4 className="fw-bold text-success">Membership Upgraded!</h4>
            <p className="text-muted mb-2">
              Thank you for upgrading your membership.  
              You’ll be redirected shortly.
            </p>
            <p className="fw-bold">Redirecting in {countdown} seconds...</p>
          </>
        )}
      </div>
    </div>
  );
}
