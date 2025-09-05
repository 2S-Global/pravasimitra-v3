"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import AlertService from "@/app/components/alertService";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { useCartStore } from "@/app/store/cartStore";
import styles from "./Login.module.css";
import { Eye, EyeOff } from "lucide-react";
const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCart } = useCartStore();
  const { setLoggedIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => {
    if (!identifier || !password) {
      AlertService.error("Please fill in both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(identifier)) {
      AlertService.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/auth/login",
        { identifier, password },
        { withCredentials: true }
      );

      // Assuming your API sends { success: true, msg: "Logged in" } on success
      if (response.data.success) {
        AlertService.success(response.data.msg);
        setLoggedIn(); // only fire if login truly succeeded

        try {
          const cartResponse = await axios.get("/api/cart/addtocart", {
            withCredentials: true,
          });
          setCart(cartResponse.data.cart);
        } catch (cartError) {
          console.error("Failed to fetch cart after login:", cartError);
        }

        router.push("/user/my-account");
      } else {
        // login failed but API returned 200
        AlertService.error(
          response.data.msg || "Login failed. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.msg || "Login failed. Please try again.";
      AlertService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      {/* <OtherBanner page_title="Login" /> */}

      <section
        className="vh-100"
        style={{ backgroundColor: "#fff", marginBottom: "100px" }}
      >
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
                    <div
                      className="card-body p-4 p-lg-5 text-black"
                      style={{ boxShadow: "0px 4px 8px white" }}
                    >
                      <form>
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
                          Sign into your account
                        </h5>
                        <div
                          data-mdb-input-init=""
                          className="form-outline mb-4"
                        >
                          <input
                            type="email"
                            className={`form-control form-control-md ${styles.loginInput}`}
                            placeholder="Email Addresss"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            autoComplete="off"
                          />
                        </div>
                        <div
                          data-mdb-input-init=""
                          className="form-outline mb-4 position-relative"
                        >
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`form-control form-control-md ${styles.loginInput}`}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y px-2"
                            style={{ textDecoration: "none" }}
                          >
                            {showPassword ? (
                              <EyeOff size={20} color="#555" />
                            ) : (
                              <Eye size={20} color="#555" />
                            )}
                          </button>
                        </div>
                        <div className="mb-4">
                          <button
                            type="button"
                            className="btn btn-lg"
                            onClick={handleLogin}
                            disabled={loading}
                            style={{
                              backgroundColor: "#FF2D1D",
                              border: "none",
                              color: "#fff",

                              padding: "0.5rem 1rem",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            {loading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Logging in...
                              </>
                            ) : (
                              <>Login</>
                            )}
                          </button>
                        </div>

                        <Link
                          className="small text-muted"
                          href="./forget-password"
                        >
                          Forgot password?
                        </Link>
                        <p
                          className="mb-5 pb-lg-2"
                          style={{ color: "#393f81" }}
                        >
                          Don't have an account?{" "}
                          <a href="/register" style={{ color: "#393f81" }}>
                            Register here
                          </a>
                        </p>

                        {/* <a href="#!" className="small text-muted">
                          Terms of use.
                        </a>
                        <a href="#!" className="small text-muted">
                          Privacy policy
                        </a> */}
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

export default Login;
