'use client'

import { useState } from "react";
import axios from "axios";
import AlertService from "@/app/components/alertService";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import Sidebar from "@/app/components/Sidebar";

const ChangePassword = () => {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!form.current_password.trim()) {
      return AlertService.error("Current password is required");
    }
    if (!form.new_password.trim()) {
      return AlertService.error("New password is required");
    }
    if (form.new_password.length < 6) {
      return AlertService.error("New password must be at least 6 characters long");
    }
    if (form.new_password !== form.confirm_password) {
      return AlertService.error("New password and confirm password do not match");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/api/auth/change-password", // 👈 adjust API endpoint if needed
        {
          currentPassword: form.current_password,
          newPassword: form.new_password,
          confirmNewPassword:form.confirm_password
        },
        { withCredentials: true }
      );

      AlertService.success(res.data?.message );

      // Reset form
      setForm({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
    } catch (error) {
      AlertService.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <OtherBanner page_title="Change Password" />

      <section className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <Sidebar />

            <div className="col-md-9">
              <form
                onSubmit={handleSubmit}
                className="tm-form tm-login-form tm-form-bordered form-card"
              >
                <h4
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    textDecoration: "underline",
                    marginBottom: "20px"
                  }}
                >
                  Change Password
                </h4>

                <div className="tm-form-inner">
                  <div className="row col-md-12">
                    <div className="col-md-9">
                      <div className="tm-form-field mb-3">
                        <label htmlFor="current_password">
                          Current Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="current_password"
                          id="current_password"
                          placeholder="Enter current password"
                          value={form.current_password}
                          onChange={handleChange}
            
                        />
                      </div>

                      <div className="tm-form-field mb-3">
                        <label htmlFor="new_password">
                          New Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="new_password"
                          id="new_password"
                          placeholder="Enter new password"
                          value={form.new_password}
                          onChange={handleChange}
                 
                        />
                      </div>

                      <div className="tm-form-field mb-4">
                        <label htmlFor="confirm_password">
                          Confirm New Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="confirm_password"
                          id="confirm_password"
                          placeholder="Confirm new password"
                          value={form.confirm_password}
                          onChange={handleChange}
                   
                        />
                      </div>

                      <div className="tm-form-field text-center">
                        <button
                          type="submit"
                          className="btn btn-danger px-4"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ChangePassword;
