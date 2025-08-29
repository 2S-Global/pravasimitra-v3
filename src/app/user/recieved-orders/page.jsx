"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import { useRouter } from "next/navigation";
import axios from "axios";

const ReceivedOrders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/order-list/seller", {
          withCredentials: true,
        });

        const orderData = res.data?.orders || [];
        setOrders(orderData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Shipped":
        return "warning text-dark";
      case "Cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Header />
      <OtherBanner
        page_title="My Received Orders"
        banner_image="/assets/images/bg/furniture_banner.jpg"
      />

      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <div className="profile-info col-md-12">
              <form className="tm-form tm-login-form tm-form-bordered form-card">
                <h4
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                >
                  My Received Orders
                </h4>

                {loading ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: 300 }}
                  >
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading orders...</span>
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{ minHeight: "400px", textAlign: "center" }}
                  >
                    <img
                      src="/assets/images/empty-box.webp"
                      alt="No orders"
                      style={{ width: 150, marginBottom: 20 }}
                    />
                    <h5 className="text-muted mb-2">
                      You haven’t received any orders yet.
                    </h5>
                    <p className="text-muted mb-3">
                      Once buyers purchase your products, orders will appear
                      here.
                    </p>
                    <button
                      type="button"
                      className="btn text-white"
                      style={{
                        backgroundColor: "#FF2D1D",
                        borderColor: "#FF2D1D",
                      }}
                      onClick={() =>
                        router.push("/user/marketplace/list")
                      }
                    >
                      Add Product
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive mt-4">
                    <table className="table table-hover align-middle text-center table-striped">
                      <thead className="table-light">
                        <tr>
                          <th>Sl No</th>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Payment Method</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => (
                          <tr key={order.id}>
                            <td className="fw-semibold">{index + 1}</td>
                            <td className="fw-semibold text-primary">
                              {order.orderId}
                            </td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-GB"
                              )}
                            </td>
                            <td className="text-muted">
                              {order.paymentMethod?.toUpperCase()}
                            </td>
                            <td className="fw-semibold">
                              <strong>{order.currency}</strong>
                              {order.orderTotal}
                            </td>

                            <td>
                              <button
                                type="button" // 👈 this prevents form submit
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                                onClick={() =>
                                  router.push(
                                    `/user/recieved-orders/details/${order.id}`
                                  )
                                }
                                style={{ padding: "6px 9px" }}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ReceivedOrders;
