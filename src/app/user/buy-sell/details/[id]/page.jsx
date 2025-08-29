"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/app/store/authStore";
import AlertService from "@/app/components/alertService";

const ProductDetails = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [item, setItem] = useState({});
  const { id } = useParams();
  const thumbnailRefs = useRef([]);
  const [contactLoading, setContactLoading] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

      const contactSeller = await axios.post("/api/product/contact-seller", {
        productId: item.id,
        sellerId: item.createdBy._id,
      });
      AlertService.success(contactSeller.data.msg);
    } catch (error) {
      // console.error(error);
      AlertService.error("Failed to contact the seller. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      // alert("hello");
      try {
        setLoading(true);
        const productDetails = await axios.get("/api/product/product-details", {
          params: { id },
        });
        // console.log(productDetails.data.item);
        setSelectedImage(productDetails.data.item.image);

        setItem(productDetails.data.item);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (item?.gallery && selectedImage) {
      const index = item.gallery.indexOf(selectedImage);
      setSelectedImageIndex(index);
    }
  }, [selectedImage, item.gallery]);

  useEffect(() => {
    const currentThumb = thumbnailRefs.current[selectedImageIndex];
    if (currentThumb) {
      currentThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedImageIndex]);
  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      setSelectedImage(item.gallery[newIndex]);
      setSelectedImageIndex(newIndex);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < item.gallery.length - 1) {
      const newIndex = selectedImageIndex + 1;
      setSelectedImage(item.gallery[newIndex]);
      setSelectedImageIndex(newIndex);
    }
  };
  return (
    <>
      <Header />
      <OtherBanner
        page_title="Product Details"
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
        <div className="tm-section tm-login-register-area bg-white tm-padding-section">
          <div className="container my-5">
            <div className="row g-5 align-items-start">
              {/* Image Section */}
              <div className="col-md-6">
                <div className="shadow-sm rounded overflow-hidden mb-3">
                  <img
                    src={selectedImage || item.image}
                    alt="Product"
                    className="img-fluid w-100 object-fit-cover"
                    style={{ height: "450px", borderRadius: "12px" }}
                  />
                </div>

                {/* Thumbnails with Prev/Next */}
                <div className="position-relative mt-3">
                  {/* Prev Button */}
                  <button
                    type="button"
                    className="btn btn-light position-absolute top-50 start-0 translate-middle-y shadow"
                    style={{ zIndex: 1 }}
                    onClick={handlePrevImage}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>

                  {/* Scrollable Thumbnails */}
                  <div
                    id="thumbnail-scroll"
                    className="d-flex gap-2 overflow-auto px-5"
                    style={{
                      scrollBehavior: "smooth",
                      scrollSnapType: "x mandatory",
                    }}
                  >
                    {item.gallery.map((img, index) => (
                      <img
                        key={index}
                        ref={(el) => (thumbnailRefs.current[index] = el)}
                        src={img}
                        alt={`Thumbnail ${index}`}
                        className={`img-thumbnail ${
                          selectedImage === img ? "border border-danger" : ""
                        }`}
                        style={{
                          height: "80px",
                          width: "100px",
                          objectFit: "cover",
                          cursor: "pointer",
                          scrollSnapAlign: "center",
                          flex: "0 0 auto",
                        }}
                        onClick={() => {
                          setSelectedImage(img);
                          setSelectedImageIndex(index);
                        }}
                      />
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    className="btn btn-light position-absolute top-50 end-0 translate-middle-y shadow"
                    style={{ zIndex: 1 }}
                    onClick={handleNextImage}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>

              {/* Product Details */}
        <div className="col-md-6">
  {/* Title */}
  <h2 className="fw-bold mb-3">{item.title}</h2>

  {/* Category */}
  <p className="text-secondary mb-2 d-flex align-items-center">
    <i className="bi bi-tags me-2 text-primary"></i>
    <span>
      Category:{" "}
      <span className="badge bg-light text-dark border">
        {item.category.name}
      </span>
    </span>
  </p>

  {/* Location */}
  <p className="text-secondary mb-2 d-flex align-items-center">
    <i className="bi bi-geo-alt me-2 text-danger"></i>
    <span>
      {item.city.name}, {item.country.name}
    </span>
  </p>

  {/* Address */}
  <p className="text-secondary mb-3 d-flex align-items-center">
    <i className="bi bi-house-door me-2 text-success"></i>
    <span className="text-dark">
      {item.location}
    
    </span>
  </p>

  {/* Price */}
  <h3 className="text-success fw-bold mb-4">
    {item.currency}{item.price}
  </h3>

  {/* Description */}
  <p className="text-muted mb-4" style={{ textAlign: "justify" }}>
    {item.shortDesc}
  </p>

  {/* Actions */}
  <div className="d-flex gap-2">
    <button
      className="btn btn-danger px-4 rounded-pill shadow-sm"
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
          <i className="bi bi-chat-dots me-2"></i> Contact Seller
        </>
      )}
    </button>
  </div>
</div>
            </div>

            {/* Tabs Section */}
            <div className="row mt-5">
              <div className="col-12">
                <ul
                  className="nav nav-pills mb-3"
                  id="productTab"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="desc-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#desc"
                      type="button"
                      role="tab"
                      style={{
                        background: "#c12020",
                        color: "#fff",
                        border: "#c12020",
                        cursor:"auto"
                      }}
                    >
                      Description
                    </button>
                  </li>
                  {/*                 <li className="nav-item" role="presentation">
                  <button className="nav-link" id="reviews-tab" data-bs-toggle="pill" data-bs-target="#reviews" type="button" role="tab">
                    Reviews (112)
                  </button>
                </li> */}
                </ul>
                <div
                  className="tab-content border rounded p-4 shadow-sm bg-light"
                  id="productTabContent"
                >
                  <div
                    className="tab-pane fade show active"
                    id="desc"
                    role="tabpanel"
                  >
                    <p className="text-muted" style={{ textAlign: "justify" }}>
                      {item.description}
                    </p>
                  </div>
                  {/* <div className="tab-pane fade" id="reviews" role="tabpanel">
                    <p className="text-muted">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </div> */}
                </div>
              </div>
            </div>

            {/* SOS Floating Button */}
    
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default ProductDetails;
