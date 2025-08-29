"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

const Orders = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applyList, setapplyList] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/rent-lease/my-contact");
      setapplyList(response.data.list);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <Header />
      <OtherBanner
        page_title="Apply List (Rent & Lease)"
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
                  Apply List (Rent & Lease)
                </h4>

       {loading ? (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ minHeight: "300px" }}
  >
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading products...</span>
    </div>
  </div>
) : Array.isArray(applyList) && applyList.length === 0 ? (
  <div className="text-center my-5">
    <div
      className="mx-auto mb-3 d-flex align-items-center justify-content-center"
      style={{
        height: "80px",
        width: "80px",
        borderRadius: "50%",
        backgroundColor: "#f0f2f5",
      }}
    >
      <i className="bi bi-emoji-frown fs-1 text-muted"></i>
    </div>
    <h5 className="fw-semibold text-dark">No Contacts Yet</h5>
    <p className="text-muted">
      You haven’t contacted any owner. Start exploring products to connect with sellers.
    </p>
  </div>
) : (
  // ✅ keep your table here unchanged
  <div className="table-responsive mt-4">
    <table className="table table-striped align-middle text-center">
      <thead className="table-light">
        <tr>
          <th>Sl no</th>
          <th>Items Image</th>
          <th>Items Name</th>
          <th>Seller Name</th>
          <th>Seller Email</th>
          <th>Seller Phone</th>
          <th>Apply Date</th>
        </tr>
      </thead>
      <tbody>
        {applyList.map((order, index) => (
          <tr key={order.id}>
            <td className="fw-semibold text-primary">#{index + 1}</td>
            <td>
              <img
                src={order.roomImages}
                alt={order.roomTitle}
                style={{
                  height: "80px",
                  width: "80px",
                  objectFit: "cover",
                }}
              />
            </td>
            <td>{order.roomTitle}</td>
            <td>{order.ownerName}</td>
            <td>{order.ownerEmail}</td>
            <td>{order.ownerPhone}</td>
            <td>
              {new Date(order.contactedAt).toLocaleDateString("en-GB")}
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

export default Orders;
