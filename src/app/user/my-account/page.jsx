"use client";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import Sidebar from "@/app/components/Sidebar";
import AlertService from "@/app/components/alertService";
import axios from "axios";
import useUserStore from "@/app/store/useUserStore";

const MyAccount = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",  
    address: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    dob: "",
    gender: "",
    passportNumber: "",
    passportExpiry: "",
    visaNumber: "",
    visaExpiry: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  // Helpers for date conversion
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`; // YYYY-MM-DD for input
  };

  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`; // DD-MM-YYYY for API
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  // Allow only alphabets and spaces for these fields
  const alphaOnlyFields = ["name", "fatherName", "motherName", "spouseName"];
  if (alphaOnlyFields.includes(name)) {
    const regex = /^[A-Za-z\s]*$/;
    if (!regex.test(value)) {
      return; // ❌ ignore invalid characters
    }
  }

    if (name === "phone") {
    const regex = /^[0-9]*$/;
    if (!regex.test(value)) return; // ❌ ignore non-numeric
    if (value.length > 10) return;  // ❌ ignore if more than 10 digits
  }

  setForm({ ...form, [name]: value });
  };

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/auth/profile", {
          withCredentials: true,
        });
        const data = res.data;

        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.mobile || "",
          address: data.user.address || "",
          fatherName: data.user.fatherName || "",
          motherName: data.user.motherName || "",
          spouseName: data.user.spouseName || "",
          dob: formatDateForInput(data.user.dateOfBirth),
          gender: data.user.gender || "",
          passportNumber: data.user.passportNumber || "",
          passportExpiry: formatDateForInput(data.user.passportExpiry),
          visaNumber: data.user.visaNumber || "",
          visaExpiry: formatDateForInput(data.user.visaExpiry),
        });

        setUser({ ...data.user });
      } catch (error) {
        AlertService.error(
          error.response?.data?.message || "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return AlertService.error("Name is required");
    }
    if (!form.email.trim()) {
      return AlertService.error("Email is required");
    }
    if (!form.phone.trim()) {
      return AlertService.error("Phone number is required");
    }
    if (!form.dob.trim()) {
      return AlertService.error("Date of Birth is required");
    }
    if (!form.gender.trim()) {
      return AlertService.error("Gender is required");
    }
    if (!form.address.trim()) {
      return AlertService.error("Address is required");
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        dateOfBirth: formatDateForAPI(form.dob),
        passportExpiry: formatDateForAPI(form.passportExpiry),
        visaExpiry: formatDateForAPI(form.visaExpiry),
      };
      const res = await axios.put("/api/auth/profile", payload, {
        withCredentials: true,
      });
      AlertService.success("Profile updated successfully");
      setUser(res.data.user);
      setUser(res.data.user);
    } catch (error) {
      AlertService.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <OtherBanner page_title="My Account" />

      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <Sidebar />

            <div className="profile-info col-md-9">
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "400px" }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="tm-form tm-login-form tm-form-bordered form-card"
                >
                  <h4
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      textDecoration: "underline",
                    }}
                  >
                    Profile Information
                  </h4>

                  <div className="tm-form-inner">
                    <div className="row col-md-12">
                      <div className="col-md-4">
                        <div className="tm-form-field">
                          <label htmlFor="name">
                            Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="tm-form-field">
                          <label htmlFor="fatherName">Father's Name </label>
                          <input
                            type="text"
                            className="form-control"
                            name="fatherName"
                            value={form.fatherName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="tm-form-field">
                          <label htmlFor="motherName">Mother's Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="motherName"
                            value={form.motherName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row col-md-12">
                      <div className="col-md-4">
                        <div className="tm-form-field">
                          <label htmlFor="spouseName">Spouse Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="spouseName"
                            value={form.spouseName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="tm-form-field">
                          <label htmlFor="email">
                            Email <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="tm-form-field">
                          <label htmlFor="phone">
                            Phone Number <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row col-md-12">
                      <div className="col-md-6">
                        <div className="tm-form-field">
                          <label htmlFor="dob">
                            Date of Birth <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            name="dob"
                            value={form.dob}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="tm-form-field">
                          <label htmlFor="gender">
                            Gender <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-control"
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                          >
                            <option value="">
                              Select Gender{" "}
                              
                            </option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row col-md-12">
                      <div className="col-md-12">
                        <label className="tm-form-field">
                          Address <span className="text-danger">*</span>
                        </label>
                        <textarea
                          name="address"
                          className="form-control"
                          value={form.address}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <br />

                  <h4
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      textDecoration: "underline",
                    }}
                  >
                    Other Information
                  </h4>

                  <div className="tm-form-inner">
                    <div className="container">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="tm-form-field">
                            <label htmlFor="passportNumber">
                              Passport Number
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="passportNumber"
                              value={form.passportNumber}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="tm-form-field">
                            <label htmlFor="passportExpiry">
                              Passport Expiry
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              name="passportExpiry"
                              value={form.passportExpiry}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="tm-form-field">
                            <label htmlFor="visaNumber">Visa Number</label>
                            <input
                              type="text"
                              className="form-control"
                              name="visaNumber"
                              value={form.visaNumber}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="tm-form-field">
                            <label htmlFor="visaExpiry">Visa Expiry</label>
                            <input
                              type="date"
                              className="form-control"
                              name="visaExpiry"
                              value={form.visaExpiry}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="tm-form-field"
                    style={{ textAlign: "center" }}
                  >
                    <div
                      className="tm-form-field text-center"
                      style={{ textAlign: "center" }}
                    >
                      <button
                        type="submit"
                        className="btn btn-danger px-4"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Profile"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MyAccount;
