"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import AlertService from "@/app/components/alertService";
import { useRef } from "react";

const ProductDetails = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [item, setItem] = useState("");
  const { id } = useParams();
  const [ingredient, setIngredient] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const thumbnailRef = useRef(null); // 👈 reference to thumbnail scroll container
  const scrollAmount = 120; // px to scroll each time

  const handlePrevImage = () => {
    const currentIndex = item.images.indexOf(selectedImage);
    if (currentIndex > 0) {
      setSelectedImage(item.images[currentIndex - 1]);

      // 👇 scroll thumbnails left
      if (thumbnailRef.current) {
        thumbnailRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  const handleNextImage = () => {
    const currentIndex = item.images.indexOf(selectedImage);
    if (currentIndex < item.images.length - 1) {
      setSelectedImage(item.images[currentIndex + 1]);

      // 👇 scroll thumbnails right
      if (thumbnailRef.current) {
        thumbnailRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      AlertService.error("Please login first to add the product in cart.");
      return;
    }

    if (!item?.id || !item?.createdBy) {
      AlertService.error("Invalid product or seller information.");
      return;
    }

    try {
      setContactLoading(true);

      const addToCart = await axios.post("/api/cart/addtocart", {
        productId: item.id,
        quantity: 1,
        price: item.price,
        sellerId: item.createdBy._id,
      });
      AlertService.success(addToCart.data.message);
    } catch (error) {
      // console.error(error);
      AlertService.error("Failed to contact the seller. Please try again.");
    } finally {
      setContactLoading(false);
      router.push(`/cart`);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      // alert("hello");
      try {
        setLoading(true);
        const productDetails = await axios.get("/api/marketplace/details", {
          params: { id },
        });
        // console.log(productDetails.data.item);
        setSelectedImage(productDetails.data.item.images[0]);

        setItem(productDetails.data.item);
        // console.log(productDetails.data.item.id);
        setIngredient(productDetails.data.item.category.name);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  return (
    <>
      <Header />
      <OtherBanner
        page_title="Product Details"
        banner_image="/assets/images/bg/marketplace.png"
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
                    src={selectedImage}
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
                    ref={thumbnailRef} // 👈 attach ref
                    className="d-flex gap-2 overflow-auto px-5"
                    style={{
                      scrollBehavior: "smooth",
                      scrollSnapType: "x mandatory",
                    }}
                  >
                    {item.images.map((img, index) => (
                      <img
                        key={index}
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
                        onClick={() => setSelectedImage(img)}
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
                <h2 className="fw-bold mb-2">{item.title}</h2>
                <p className="text-secondary mb-2 d-flex align-items-center">
                  <i className="bi bi-tags me-2 text-primary"></i>
                  <span>
                    Category:{" "}
                    <span className="badge bg-light text-dark border">
                      {item.category.name}
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

                {/* {(ingredient === "Cooked Food" ||
                  ingredient === "Packaged Food") && (
                  <p className="text-secondary mb-3 mt-2">
                    Ingredients:{" "}
                    <strong className="text-dark">{item.ingredients}</strong>
                  </p>
                )} */}
                {/* <div className="d-flex align-items-center mb-3">
                  <span className="badge bg-success me-2">In Stock</span>
                  <span className="text-warning fw-semibold fs-5">★★★★☆</span>
                  <small className="ms-2 text-muted">(112 reviews)</small>
                </div> */}

                <h3 className="text-success fw-bold mb-4">
                  {item.currency}
                  {item.price}
                </h3>
                <p className="text-muted mb-4" style={{ textAlign: "justify" }}>
                  {item.shortDesc}
                </p>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary px-4"
                    style={{ background: "#c12020", border: "#c12020" }}
                    onClick={handleAddToCart}
                    disabled={contactLoading}
                  >
                    {contactLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cart-plus me-2"></i>Add To Cart
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
                      }}
                    >
                      Description
                    </button>
                  </li>
                  {/*  <li className="nav-item" role="presentation">
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
