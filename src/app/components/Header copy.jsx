"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/app/store/authStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/store/cartStore";
import useUserStore from "@/app/store/useUserStore";
const Header = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setLoggedOut = useAuthStore((state) => state.setLoggedOut);
  const router = useRouter();
const totalQuantity = useCartStore((state) => state.totalQuantity);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/profile", {
          withCredentials: true, // 👈 reads token from cookies
        });

        if (res.data?.user) {
          setUser(res.data.user); // store full user object in Zustand
        }
      } catch (error) {
     console.log(error);
      }
    };

    if (!user?._id) {
      fetchUser();
    } 
  }, [user?._id, setUser]);
  

const handleLogout = async () => {
  const { clearCart } = useCartStore.getState();
  try {
    // console.log("Starting logout process...");
    await axios.post("/api/auth/logout", {}, { withCredentials: true });

    clearCart();

    setLoggedOut();
    setTimeout(() => {
      router.replace("/login");
      window.location.reload(); // optional, if you want a full reload
    }, 2000);

  } catch (err) {
    console.error("Logout error:", err);
    clearCart();

    setLoggedOut();

    setTimeout(() => {
      router.replace("/login");
      window.location.reload(); // optional, if you want a full reload
    }, 2000);

  }
};


  return (
    <div id="wrapper" className="wrapper">
      <div className="header">
        {/* Header Top Area */}
        <div className="header-toparea">
          <div className="container">
            <div className="row">
              <div className="col-md-7 col-sm-8 col-12">
                <div className="header-topinfo">
                  <ul>
                    <li>
                      <a href="tel://+12022152529">
                        <i className="flaticon-phone-call" /> +1(202) 215 2529
                      </a>
                    </li>
                    <li>
                      <a href="mailto://contact@example.com">
                        <i className="flaticon-envelope" />
                        info@pravasimitra.us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-md-5 col-sm-4 col-12">
                <div className="header-topsocial">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fab fa-twitter" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fab fa-facebook-f" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*// Header Top Area */}

        {/* Header Bottom Area */}
        <div className="header-bottomarea">
          <div className="container">
            <div className="header-bottominner">
              <div className="header-logo" style={{ width: "32%" }}>
                <Link href="/">
                  <img
                    src="/assets/images/logo/logo-dark.png"
                    alt="logo"
                    style={{ maxWidth: "19%" }}
                  />
                </Link>
              </div>

              <nav className="tm-navigation">
                <ul>
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/about-us">About</Link>
                  </li>
                      {isLoggedIn && (
                         <>
                  <li>
                    <Link href="/user/buy-sell/buysell-category"> Buy & Sell</Link>
                  </li>
                  <li>
                    <Link href="/user/rent-lease/rentlease-category">
                      Rent & Lease
                    </Link>
                  </li>
                  <li>
                    <Link href="/user/marketplace/marketplace-category">
                      MarketPlace
                    </Link>
                  </li>
                  </>
                      )}
                  <li className="tm-navigation-dropdown">
                    <Link href="/blogs">Blogs</Link>
                  </li>
                  <li>
                    <Link href="/faq">FAQ</Link>
                  </li>
                  <li>
                    <Link href="/contact-us">Contact</Link>
                  </li>

                  {!isLoggedIn && (
                    <li>
                      <Link href="/login">Login</Link>
                    </li>
                  )}
                </ul>
              </nav>

              <div className="header-icons d-flex align-items-center">
                {/* Cart Icon */}
                <div className="cart-icon-wrapper position-relative me-3">
                  <Link href="/cart" className="text-dark position-relative">
                    <i className="fas fa-shopping-cart fa-lg"></i>
                    <span className="cart-count badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill">
                  {totalQuantity}
                    </span>
                  </Link>
                </div>

                {/* User Dropdown */}

                   {isLoggedIn && (
                      <>
                <div className="dropdown">
                  <button
                    className="btn btn-light border-0 dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="userMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ background: "transparent" }}
                  >
                    <img
                      src={ user?.image ||
                "/assets/images/default-user.png"}
                      alt="User"
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="userMenu"
                    
                  >
{/*                  
                        <li style={{ display:"block" }}>
                          <Link
                            className="dropdown-item"
                            href="/user/dashboard"
                          >
                            Dashboard
                          </Link>
                        </li> */}

                        <li style={{ display:"block" }}>
                          <Link
                            className="dropdown-item"
                            href="/user/my-account"
                          >
                            Profile
                          </Link>
                        </li>
                      <li style={{ display:"block" }}>
                          {/* <Link
                            className="dropdown-item"
                            href="/user/buy-sell/buyer-list"
                          >
                           Apply List (Buy/Sell)
                          </Link> */}
                        </li>
                 
               
                        <li style={{ display:"block" }}>
                          <Link className="dropdown-item" href="/user/orders">
                           My Orders
                          </Link>
                        </li>

                        <li style={{ display:"block" }}>
                          <Link className="dropdown-item" href="/user/recieved-orders">
                           Recieved Orders
                          </Link>
                        </li>

                        <li style={{ display:"block" }}>
                          <Link
                            className="dropdown-item"
                            href="/user/buy-sell/list"
                          >
                            Manage Buy/Sell
                          </Link>
                        </li>

                        <li style={{ display:"block" }}> 
                          <Link
                            className="dropdown-item"
                            href="/user/rent-lease/list"
                          >
                            Manage Rent/Lease
                          </Link>
                        </li>
                        <li style={{ display:"block" }}>
                          <Link
                            className="dropdown-item"
                            href="/user/marketplace/list"
                          >
                            Manage MarketPlace
                          </Link>
                        </li>
                   
                    <li style={{ display:"block" }}>
                      <hr className="dropdown-divider" />
                    </li>
              
                      <li>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item"
                          
                        >
                          Logout
                        </button>
                      </li>
               
                  </ul>
                </div>
                   </>
                    )}
              </div>

              <div className="header-searchbox">
                <div className="header-searchinner">
                  <form action="#" className="header-searchform">
                    <input type="text" placeholder="Enter search keyword.." />
                  </form>
                  <button className="search-close">
                    <i className="fas fa-times" />
                  </button>
                </div>
              </div>
            </div>

            <div className="header-mobilemenu clearfix">
              <div className="tm-mobilenav" />
            </div>
          </div>
        </div>
        {/*// Header Bottom Area */}
      </div>
    </div>
  );
};

export default Header;
