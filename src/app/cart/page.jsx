"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import axios from "axios";
import { useCartStore } from "@/app/store/cartStore"; // ✅ Import Zustand store
import AlertService from "../../app/components/alertService";
import { useAuthStore } from "@/app/store/authStore"; 

const Cart = () => {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState([]);
  const [currency, setCurrency] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { setCart } = useCartStore();
    const { isLoggedIn } = useAuthStore(); 

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const response = await axios.post("/api/cart/updatequantity", {
        productId,
        delta: newQuantity,
      });

      setCartItems(response?.data?.cart?.items);
      setCartTotal(response?.data?.cart?.cartTotal);
      setCurrency(response.data.cart.currency);
      setCart(response.data.cart);
      // console.log(response.data.cart.items);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    AlertService.confirm(
      "Remove Item",
      "Are you sure you want to remove this item?",
      async () => {
        try {
          const response = await axios.delete("/api/cart/deleteCart", {
            data: { productId },
          });

          setCartItems(response.data.cart.items);
          setCartTotal(response.data.cart.cartTotal);
          setCart(response.data.cart);
          setCurrency(response.data.cart.currency);
          AlertService.success("Item removed successfully!");
        } catch (error) {
          console.error("Error deleting:", error);
          AlertService.error("Failed to remove item.");
        }
      },
      () => {
        AlertService.message("Item not removed");
      }
    );
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isLoggedIn) {
        // ✅ skip API if not logged in
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cartDetails = await axios.get("/api/cart/addtocart", {
          withCredentials: true,
        });

        setCartItems(cartDetails.data?.cart?.items || []);
        setCartTotal(cartDetails?.data?.cart?.cartTotal || 0);
        setCart(cartDetails?.data?.cart || []);
        setCurrency(cartDetails?.data?.cart?.currency || "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isLoggedIn]);

  const handleCheckout = () => {
    setCheckoutLoading(true);
    // simulate short delay for UI
    setTimeout(() => {
      router.push("/user/checkout");
    }, 500);
  };

  return (
    <>
      <Header />
      <OtherBanner
        page_title="Your Cart"
        banner_image="/assets/images/bg/furniture_banner.jpg"
      />

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
        <section className="py-5 bg-light">
          <div className="container">
            <h2 className="mb-4 fw-bold text-center">Shopping Cart</h2>

            {cartItems.length === 0 ? (
              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="text-center p-5 rounded border shadow-sm bg-light">
                    <img
                      src="/assets/images/empty-box.png"
                      alt="No Records"
                      className="mx-auto d-block"
                      style={{
                        width: "120px",
                        opacity: 0.5,
                        marginBottom: "20px",
                      }}
                    />
                    <h4 className="fw-bold text-muted">Your Cart Is Empty</h4>
                    <p className="text-secondary">
                      Sorry, we couldn't find any items in Cart.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table align-middle bg-white">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" style={{ textAlign: "center" }}>
                          Product
                        </th>
                        <th scope="col" style={{ textAlign: "center" }}>
                          Name
                        </th>
                        <th scope="col" style={{ textAlign: "center" }}>
                          Quantity
                        </th>
                        <th scope="col" style={{ textAlign: "center" }}>
                          Price
                        </th>
                        <th scope="col" style={{ textAlign: "center" }}>
                          Subtotal
                        </th>
                        <th scope="col" style={{ textAlign: "center" }}>
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.productId}>
                          <td style={{ textAlign: "-webkit-center" }}>
                            <img
                              src={item.product?.images[0]}
                              alt={item.product.title}
                              width="70"
                              height="70"
                            />
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              maxWidth: "250px",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                          >
                            {item.product.title.split(" ").length > 20
                              ? item.product.title
                                  .split(" ")
                                  .slice(0, 20)
                                  .join(" ") + "..."
                              : item.product.title}
                          </td>
                          <td style={{ textAlign: "-webkit-center" }}>
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              style={{ width: 32, height: 32 }}
                            >
                              -
                            </button>
                            <span className="fw-bold">{item.quantity}</span>
                            <button
                              className="btn btn-sm btn-outline-secondary ms-2"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              style={{ width: 32, height: 32 }}
                            >
                              +
                            </button>
                          </td>
                          <td style={{ textAlign: "-webkit-center" }}>
                            <strong>
                              {item.currency}
                              {item.product.price}
                            </strong>
                          </td>
                          <td style={{ textAlign: "-webkit-center" }}>
                            <strong>
                              {item.currency}
                              {item.subtotal}
                            </strong>
                          </td>
                          <td style={{ textAlign: "-webkit-center" }}>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(item.productId)}
                              style={{ width: 36, height: 36 }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <div
                    className="bg-white p-4 shadow-sm rounded"
                    style={{ minWidth: "300px" }}
                  >
                    <h5 className="fw-bold mb-3">Cart Summary</h5>
                    <p className="d-flex justify-content-between mb-2">
                      <span>Subtotal</span>
                      <span>
                        <strong>
                          {currency}
                          {cartTotal}
                        </strong>
                      </span>
                    </p>
                    <hr />
                    <p className="d-flex justify-content-between fw-bold">
                      <span>Total</span>
                      <span>
                        {" "}
                        <strong>
                          {currency}
                          {cartTotal}
                        </strong>
                      </span>
                    </p>
                    <button
                      className="btn btn-danger w-100 mt-3"
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                    >
                      {checkoutLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Redirecting...
                        </>
                      ) : (
                        "Proceed to Checkout"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}
      <Footer />
    </>
  );
};

export default Cart;
