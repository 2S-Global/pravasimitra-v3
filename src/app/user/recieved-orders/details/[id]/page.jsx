"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/order-detailsSeller?id=${id}`, {
          withCredentials: true,
        });
        setOrder(res.data?.order || null);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getTotal = () =>
    order?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;

  const getStatusBadge = (status) => {
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
        page_title={`Order #${order?.orderId || ""}`}
        banner_image="/assets/images/bg/furniture_banner.jpg"
      />

 <div
  className="tm-section tm-login-register-area bg-white tm-padding-section"
  style={{ paddingTop: "50px"}}
>
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-12 profile-info">
        <form className="tm-form tm-login-form tm-form-bordered form-card shadow-sm p-4 rounded">
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "300px" }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !order ? (
            <p className="text-center text-muted mt-4">Order not found.</p>
          ) : (
            <>
              {/* Order Header */}
                 <div className="text-center mb-5">
        <h3 className="fw-bold text-dark">
          Recieved Order <span className="text-primary">#{order.orderId}</span>
        </h3>
       
      </div>

              {/* Order & Billing Info */}
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <div className="bg-light p-3 rounded shadow-sm h-100">
                    <h6 className="fw-bold mb-3">Order Info</h6>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </p>
                    <p>
                      <strong>Payment:</strong>{" "}
                      {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="bg-light p-3 rounded shadow-sm h-100">
                    <h6 className="fw-bold mb-3">Billing Details</h6>
                    <p><strong>Full Name:</strong> {order.address.billing?.fullName}</p>
                    <p><strong>Email:</strong> {order.address.billing?.email}</p>
                    <p><strong>Phone:</strong> {order.address.billing?.phone}</p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {order.address.billing?.address}, {order.address.billing?.city},{" "}
                      {order.address.billing?.state}
                    </p>
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="bg-light p-3 rounded shadow-sm h-100">
                    <h6 className="fw-bold mb-3">Shipping Address</h6>
                    <p><strong>Full Name:</strong> {order.address.shipping?.fullName}</p>
                    <p><strong>Email:</strong> {order.address.shipping?.email}</p>
                    <p><strong>Phone:</strong> {order.address.shipping?.phone}</p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {order.address.shipping?.address}, {order.address.shipping?.city},{" "}
                      {order.address.shipping?.state}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="table-responsive">
                <table className="table align-middle table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Sl No</th>
                      <th>Product</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="d-flex justify-content-center">
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="rounded border"
                              style={{ width: 60, height: 60, objectFit: "cover" }}
                            />
                          </div>
                        </td>
                        <td>{item.title}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <strong>{item.currency}</strong> {item.price}
                        </td>
                        <td>
                          <strong>{item.currency}</strong> {item.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="d-flex justify-content-end mt-4">
                <div
                  className="bg-light rounded shadow-sm p-4"
                  style={{ minWidth: 320 }}
                >
                  <h6 className="fw-bold mb-3">Order Summary</h6>
                  <div className="d-flex justify-content-between">
                    <span>Total Amount:</span>
                    <span className="fw-bold fs-5 text-primary">
                      {order.currency} {order.orderTotal}
                    </span>
                  </div>
                </div>
              </div>
            </>
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

export default OrderDetails;
