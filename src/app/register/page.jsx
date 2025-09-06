"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import Link from "next/link";
import AlertService from "@/app/components/alertService"; // your alert service
import axios from "axios";
import styles from "./Register.module.css";
import { validatePhone } from "../utils/phoneValidation";
import { Eye, EyeOff } from "lucide-react";


const Register = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    currentCountry: "",
    currentCity: "",
    destinationCountry: "",
    destinationCity: "",
  });

  const [countries, setCountries] = useState([]);
  const [currentCities, setCurrentCities] = useState([]);
  const [destinationCities, setDestinationCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const res = await axios.get("/api/location/list-country");
      if (Array.isArray(res.data?.items)) {
        setCountries(res.data.items);
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchCities = async (countryId, type) => {
    if (!countryId) return;
    try {
      setLoadingCities(true);
      const res = await axios.post("/api/location/get-city", { countryId });
      if (Array.isArray(res.data?.items)) {
        if (type === "current") {
          setCurrentCities(res.data.items);
        }
        if (type === "destination") {
          setDestinationCities(res.data.items);
        }
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // ✅ Restrict mobile input: only digits and +
    if (name === "mobile") {
      value = value.replace(/[^0-9+]/g, ""); // removes everything except numbers and +
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "currentCountry") {
      setForm((prev) => ({ ...prev, currentCity: "" }));
      setCurrentCities([]);
      if (value) fetchCities(value, "current");
    }

    if (name === "destinationCountry") {
      setForm((prev) => ({ ...prev, destinationCity: "" }));
      setDestinationCities([]);
      if (value) fetchCities(value, "destination");
    }
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
    const phoneCheck = validatePhone(form.mobile);
    if (!phoneCheck.ok) {
      AlertService.error(phoneCheck.error || "Invalid mobile number");
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

    if (!form.currentCountry || !form.currentCity)
      return AlertService.error("Current Country & City are required");
    if (!form.destinationCountry || !form.destinationCity)
      return AlertService.error("Destination Country & City are required");
    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch(`/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        AlertService.error(data.message || "Server error, try again later");
        return;
      }

      if (data.success === false) {
        // Email already exists
        AlertService.error(data.msg || "Email is already registered");
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

  useEffect(() => {
    fetchCountries();
  }, []);

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
                        placeholder="e.g. +14844578433"
                        className={styles.inputField}
                      />
                    </div>

                    <div className="tm-form-field position-relative">
                      <label htmlFor="password">
                        Password <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        value={form.password}
                        onChange={handleChange}
                        style={{ height: "45px" }}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-link position-absolute  end-0 translate-middle-y px-2"
                        style={{ textDecoration: "none", top: "45px" }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#555" />
                        ) : (
                          <Eye size={20} color="#555" />
                        )}
                      </button>
                    </div>

                    {/* Country & City dropdowns */}
                    {/* Country & City dropdowns */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="tm-form-field">
                          <label htmlFor="currentCountry">
                            Current Country{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <select
                            id="currentCountry"
                            name="currentCountry"
                            value={form.currentCountry}
                            onChange={handleChange}
                            required
                            disabled={loadingCountries}
                          >
                            <option value="">-- Select Country --</option>
                            {countries.map((country) => (
                              <option key={country._id} value={country._id}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="tm-form-field">
                          <label htmlFor="currentCity">
                            Current City <span style={{ color: "red" }}>*</span>
                          </label>
                          <select
                            id="currentCity"
                            name="currentCity"
                            value={form.currentCity}
                            onChange={handleChange}
                            required
                            disabled={!form.currentCountry || loadingCities}
                          >
                            <option value="">-- Select City --</option>
                            {currentCities.map((city) => (
                              <option key={city._id} value={city._id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="tm-form-field">
                          <label htmlFor="destinationCountry">
                            Destination Country{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <select
                            id="destinationCountry"
                            name="destinationCountry"
                            value={form.destinationCountry}
                            onChange={handleChange}
                            required
                            disabled={loadingCountries}
                          >
                            <option value="">-- Select Country --</option>
                            {countries.map((country) => (
                              <option key={country._id} value={country._id}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="tm-form-field">
                          <label htmlFor="destinationCity">
                            Destination City{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <select
                            id="destinationCity"
                            name="destinationCity"
                            value={form.destinationCity}
                            onChange={handleChange}
                            required
                            disabled={!form.destinationCountry || loadingCities}
                          >
                            <option value="">-- Select City --</option>
                            {destinationCities.map((city) => (
                              <option key={city._id} value={city._id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
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
