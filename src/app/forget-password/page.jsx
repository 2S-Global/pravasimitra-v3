"use client";
import { useState } from "react";
import axios from "axios";

import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AlertService from "@/app/components/alertService";
import { useRouter } from "next/navigation";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
const router = useRouter(); // ✅ initialize router
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      AlertService.error("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      AlertService.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);


      const res = await axios.post(
        "/api/auth/forget-password",
        { email },
        {
        
          withCredentials: true,
        }
      );

      if (res) {
        AlertService.success(res.data.msg || "Reset link sent to your email");
        setEmail("");
 
        router.push("/login");
   
      } else {
        AlertService.error(res.data.msg || "Something went wrong");
      }
    } catch (err) {
      AlertService.error(
        err.response?.data?.msg || "Error while sending reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <section className="vh-100" style={{ backgroundColor: "#fff", marginBottom: "100px" }}>
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-10">
              <div className="card" style={{ borderRadius: "1rem" }}>
                <div className="row g-0">
                  <div className="col-md-6 col-lg-5 d-none d-md-block">
                    <img
                      src="/assets/img1.jpg"
                      alt="login form"
                      className="img-fluid"
                      style={{ borderRadius: "1rem 0 0 1rem" }}
                    />
                  </div>
                  <div className="col-md-6 col-lg-7 d-flex align-items-center">
                    <div className="card-body p-4 p-lg-5 text-black"   style={{ boxShadow: "0px 4px 8px white" }}>
                      <form onSubmit={handleSubmit}>
                        <div className="d-flex align-items-center mb-3 pb-1">
                                  <img
                    src="/assets/images/logo/logo-dark.png"
                    alt="logo"
                    style={{ maxWidth: "8%" }}
                  />
               <span
                            className="h1 fw-bold mb-0 ml-3"
                            style={{ color: "#264293" }}
                          >
                            Pravasi Mitra
                          </span>
                        </div>

                        <h5
                          className="fw-normal mb-3 pb-3"
                          style={{ letterSpacing: 1 }}
                        >
                          Reset your Password
                        </h5>

                        <div className="form-outline mb-4">
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control "
                            placeholder="Email Address"
                          />
                        </div>

                        <div className="tm-form-field">
                          <button
                            type="submit"
                            className="tm-button"
                            disabled={loading}
                          >
                            {loading ? "Submitting..." : "Submit"}
                          </button>
                        </div>

                        <div className="tm-form-field">
                          <Link href="/login">Returning User Login</Link>
                        </div>

                        <p
                          className="mb-5 pb-lg-2"
                          style={{ color: "#393f81" }}
                        >
                          Don't have an account?{" "}
                          <a href="/register" style={{ color: "#393f81" }}>
                            Register here
                          </a>
                        </p>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ForgetPassword;
