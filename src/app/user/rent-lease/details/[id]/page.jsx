"use client";
import { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import AlertService from "@/app/components/alertService";
import { Content } from "next/font/google";

const RentLeaseDetails = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState([]);
  const [item, setItem] = useState(true);
  const { id } = useParams();

  const [contactLoading, setContactLoading] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    const fetchDetails = async () => {
      // alert("hello");
      try {
        setLoading(true);
        const productDetails = await axios.get("/api/rent-lease/details", {
          params: { id },
        });
        // console.log(productDetails.data.item);
        setSelectedImage(productDetails.data.item.images);
        console.log(productDetails.data.item.images);

        setItem(productDetails.data.item);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleContactSeller = async () => {
    if (!isLoggedIn) {
      AlertService.error("Please login first to contact the seller.");
      return;
    }

    if (!item?.id || !item?.createdBy?._id) {
      AlertService.error("Invalid product or seller information.");
      return;
    }

    try {
      setContactLoading(true);

      const contactSeller = await axios.post("/api/rent-lease/contact-owner", {
        roomId: item.id,
        ownerId: item.createdBy._id,
      });
      AlertService.success(contactSeller.data.msg);
    } catch (error) {
      // console.error(error);
      AlertService.error("Failed to contact the seller. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  // const images = [
  //   "https://lid.zoocdn.com/u/1200/900/6a618a847a92bcb165bc77b7d9567f3b1e0e1b91.jpg:p",
  //   "https://lid.zoocdn.com/u/1200/900/2960a330eea12120776a10898e76a7d85394cc74.jpg:p",
  //   "https://lid.zoocdn.com/u/1200/900/dc36795b6e1c231e5a1749eeb7a2f68774a80d38.jpg:p",
  //   "https://lid.zoocdn.com/u/1200/900/8b33bfb7401e957d4b99595a593fdd364ce9f5a4.jpg:p",
  //   "https://lid.zoocdn.com/u/1200/900/f2d9e42799a66420fa042631968cf43d72fd974a.jpg:p",
  //   "https://lid.zoocdn.com/u/1200/900/ea59d5b5275176b5348e0cab38ad3fd9ee03ff55.jpg:p",
  //   "https://lid.zoocdn.com/u/1200/900/6102c01fe431e928c8332575916a65504ec16297.jpg:p",
  //   "https://lid.zoocdn.com/u/1200/900/3876b4bef80347f8949a4bca7a100e85602a9c10.jpg:p",
  // ]

  const images = selectedImage;

  const [activeIndex, setActiveIndex] = useState(0);

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Header />
      <OtherBanner
        page_title="Property Details"
        banner_image="/assets/images/bg/rent.jpg"
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
        <div className="tm-section bg-white tm-padding-section">
          <div className="container">
            <div className="row col-md-12">
              <div className="profile-info col-md-12">
                <div className="property-detail shadow-sm p-4 bg-light rounded">
                  {/* Title & Price */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="fw-bold mb-1">{item.title}</h2>

                      <p className="text-secondary mb-2 d-flex align-items-center">
                        <i className="bi bi-tags me-2 text-primary"></i>
                        <span>
                          Property Type:{" "}
                          <span className="badge bg-light text-dark border">
                            {item.propertyType.name}
                          </span>
                        </span>
                      </p>

                      <p className="text-secondary mb-2 d-flex align-items-center">
                        <i className="bi bi-geo-alt me-2 text-danger"></i>
                        <span>
                          {item.city.name}, {item.country.name}
                        </span>
                      </p>
                      <p className="text-secondary mb-3 d-flex align-items-center">
                        <i className="bi bi-house-door me-2 text-success"></i>
                        <span className="text-dark">{item.location}</span>
                      </p>
                    </div>
                    <h3 className="text-success fw-bold">
                      {item.currency}
                      {item.price}/{item.frequency}
                    </h3>
                  </div>

                  {/* 🖼️ Image Carousel with Arrows */}
                  <div className="mb-4 position-relative">
                    <img
                      src={images[activeIndex]}
                      alt="Main"
                      className="img-fluid w-100 rounded shadow-sm"
                      style={{ maxHeight: "500px", objectFit: "cover" }}
                    />

                    {/* ⬅️ Prev Arrow */}
                    <button
                      className="btn btn-dark position-absolute top-50 start-0 translate-middle-y"
                      style={{ zIndex: 10 }}
                      onClick={handlePrev}
                    >
                      <i className="bi bi-chevron-left fs-5" />
                    </button>

                    {/* ➡️ Next Arrow */}
                    <button
                      className="btn btn-dark position-absolute top-50 end-0 translate-middle-y"
                      style={{ zIndex: 10 }}
                      onClick={handleNext}
                    >
                      <i className="bi bi-chevron-right fs-5" />
                    </button>
                  </div>

                  {/* 🔍 Thumbnail Navigation */}
                  <div className="d-flex flex-wrap mt-3 gap-2">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        onClick={() => handleThumbnailClick(i)}
                        alt={`thumb-${i}`}
                        className={`img-thumbnail ${
                          i === activeIndex ? "border-primary" : ""
                        }`}
                        style={{
                          width: "100px",
                          height: "75px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>

                  {/* 🚪 Property Features */}
                  <div className="row mb-4 mt-4">
                    <div className="col-md-3 col-6">
                      <div className="border p-3 text-center rounded bg-white">
                        <h6 className="text-muted mb-1">Bedrooms</h6>
                        <strong>{item.bedrooms}</strong>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="border p-3 text-center rounded bg-white">
                        <h6 className="text-muted mb-1">Bathrooms</h6>
                        <strong>{item.bathrooms}</strong>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mt-3 mt-md-0">
                      <div className="border p-3 text-center rounded bg-white">
                        <h6 className="text-muted mb-1">Area</h6>
                        <strong>{item.roomSize}</strong>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mt-3 mt-md-0">
                      <div className="border p-3 text-center rounded bg-white">
                        <h6 className="text-muted mb-1">Furnished</h6>
                        <strong>{item.furnished}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 📞 Contact Buttons */}
                  <div className="d-flex gap-2 mb-5 mt-5">
                    <button
                      className="btn btn-primary px-4"
                      style={{ background: "#c12020", border: "#c12020" }}
                      onClick={handleContactSeller}
                      disabled={contactLoading}
                    >
                      {contactLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Contacting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cart-plus me-2"></i> Contact Owner
                        </>
                      )}
                    </button>
                  </div>

                  <div></div>

                  {/* 🧾 Tabs */}
                  <ul
                    className="nav nav-tabs mb-3"
                    id="propertyTabs"
                    role="tablist"
                  >
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link active"
                        id="desc-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#desc"
                        type="button"
                        role="tab"
                        aria-controls="desc"
                        aria-selected="true"
                        style={{
                          background: "#c12020",
                          color: "#fff",
                          border: "#c12020",
                        }}
                      >
                        Description
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="amenities-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#amenities"
                        type="button"
                        role="tab"
                        aria-controls="amenities"
                        aria-selected="false"
                        style={{
                          background: "#2A4595",
                          color: "#fff",
                          border: "#2A4595",
                        }}
                      >
                        Amenities
                      </button>
                    </li>
                  </ul>

                  <div
                    className="tab-content border rounded p-4 bg-white"
                    id="propertyTabsContent"
                  >
                    <div
                      className="tab-pane fade show active"
                      id="desc"
                      role="tabpanel"
                      aria-labelledby="desc-tab"
                    >
                      <p style={{ textAlign: "justify" }}>
                        {item?.description}
                      </p>
                    </div>

                    <div
                      className="tab-pane fade"
                      id="amenities"
                      role="tabpanel"
                      aria-labelledby="amenities-tab"
                    >
                      <ul className="list-unstyled">
                        {item?.amenities?.map((amenity) => (
                          <li key={amenity._id} className="fw-bold text-dark">
                            • {amenity.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 🆘 SOS Button */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default RentLeaseDetails;
