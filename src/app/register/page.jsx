"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import Link from "next/link";
import AlertService from "@/app/components/alertService"; // your alert service

const Register = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    if (!form.name) {
      AlertService.error("Full Name is required");
      return false;
    }
    if (!nameRegex.test(form.name)) {
      AlertService.error("Name must contain only alphabets");
      return false;
    }
    if (!form.email) {
      AlertService.error("Email is required");
      return false;
    }
    if (!emailRegex.test(form.email)) {
      AlertService.error("Enter a valid email address");
      return false;
    }
    if (!form.mobile) {
      AlertService.error("Mobile number is required");
      return false;
    }
    if (!mobileRegex.test(form.mobile)) {
      AlertService.error("Mobile number must be 10 digits");
      return false;
    }
    if (!form.password) {
      AlertService.error("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      AlertService.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

const handleNext = async () => {
  if (!validateForm()) return;

  try {
    const res = await fetch(`/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json();

    if (!res.ok) {
      AlertService.error(data.message || 'Server error, try again later');
      return;
    }

    if (data.success === false) {
      // Email already exists
      AlertService.error(data.msg || 'Email is already registered');
      return;
    }

    // ✅ If email does not exist → save and go next
    sessionStorage.setItem("registerData", JSON.stringify(form));
    router.push("/register-final");

  } catch (err) {
    AlertService.error("Something went wrong, please try again later.");
    console.error(err);
  }
};

  return (
    <>
      <Header />
      <OtherBanner page_title="Register Now" />

      <main className="main-content">
        <div className="tm-section tm-login-register-area bg-white tm-padding-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-3" />
              <div className="col-lg-6">
                <div className="tm-form tm-login-form tm-form-bordered">
                  <h4>Register Now</h4>
                  <div className="tm-form-inner">
                    <div className="tm-form-field">
                      <label htmlFor="name">
                        Full Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={form.name}
                        onChange={handleChange}
                        onKeyPress={(e) => {
                          // Allow only letters and space
                          const regex = /^[A-Za-z\s]$/;
                          if (!regex.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>

                    <div className="tm-form-field">
                      <label htmlFor="email">
                        Email <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="tm-form-field">
                      <label htmlFor="mobile">
                        Mobile <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="mobile"
                        id="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        maxLength={10} // restrict maximum length to 10
                        onKeyPress={(e) => {
                          // Allow only digits
                          const regex = /^[0-9]$/;
                          if (!regex.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>

                    <div className="tm-form-field">
                      <label htmlFor="password">
                        Password <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={form.password}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="tm-form-field">
                      <button
                        type="button"
                        className="tm-button"
                        onClick={handleNext}
                      >
                        Next
                      </button>
                    </div>

                    <div className="tm-form-field">
                      <Link href="/login">Returning User Login</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Register;
