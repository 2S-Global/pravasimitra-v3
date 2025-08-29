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
        const res = await axios.get(`/api/order-detailsBuyer?id=${id}`, {
          withCredentials: true,
        });
        setOrder(res.data?.orderDetails || null);
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


      <div className="tm-section tm-login-register-area bg-white tm-padding-section"   style={{ paddingTop: "20px" }}>
<div className="container py-5">
  {loading ? (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : !order ? (
    <p className="text-center text-muted mt-4">Order not found.</p>
  ) : (
    <>
      {/* Title */}
      <div className="text-center mb-5">
        <h3 className="fw-bold text-dark">
          My Order <span className="text-primary">#{order.orderId}</span>
        </h3>
       
      </div>

      {/* Info Cards */}
      <div className="row g-4">
        {/* Order Info */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0 rounded-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3 text-primary">📝 Order Info</h6>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
              <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0 rounded-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3 text-primary">💳 Billing Details</h6>
              <p><strong>Name:</strong> {order.address.billing?.fullName}</p>
              <p><strong>Email:</strong> {order.address.billing?.email}</p>
              <p><strong>Phone:</strong> {order.address.billing?.phone}</p>
              <p><strong>Address: </strong> 
                 {order.address.billing?.address}, {order.address.billing?.city}, {order.address.billing?.state}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0 rounded-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3 text-primary">📦 Shipping Address</h6>
              <p><strong>Name:</strong> {order.address.shipping?.fullName}</p>
              <p><strong>Email:</strong> {order.address.shipping?.email}</p>
              <p><strong>Phone:</strong> {order.address.shipping?.phone}</p>
              <p ><strong>Address: </strong> 
                {order.address.shipping?.address}, {order.address.shipping?.city}, {order.address.shipping?.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card mt-5 shadow-sm border-0 rounded-4">
        <div className="card-body table-responsive">
          <h6 className="fw-bold mb-3 text-primary">🛍️ Ordered Items</h6>
          <table className="table align-middle table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th colSpan="2">Product</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Price</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td width="70">
                    <img
                      src={item.productDetails.images[0]}
                      alt={item.productDetails.title}
                      className="rounded shadow-sm"
                      width={60}
                      height={60}
                      style={{ objectFit: "cover" }}
                    />
                  </td>
                  <td>{item.productDetails.title}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end fw-bold">
                    {item.productDetails.currency}{item.productDetails.price}
                  </td>
                  <td className="text-end fw-bold">
                    {item.productDetails.currency}{item.subtotal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Total */}
      <div className="d-flex justify-content-end mt-4">
        <div className="card shadow-sm border-0 rounded-4" style={{ minWidth: 320 }}>
          <div className="card-body">
            <h6 className="fw-bold mb-3 text-primary">💰 Order Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Total Amount:</span>
              <span className="fw-bold fs-5">
                {order.currency}{order.calculatedTotal}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>

      </div>

      <Footer />
    </>
  );
};

export default OrderDetails;
