"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const ListHomes = () => {
  const router = useRouter();
  const { category, id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(id || "");
  const [allCategories, setAllCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [priceRangeOptions, setPriceRangeOptions] = useState([]);
  const [currency, SetCurrency] = useState("");
  const handleClear = async () => {
    try {
      setLocation("");
      setPriceRange("");
      setBedrooms("");
      setSearchTerm("");

      await fetchProducts(selectedCategory); // Re-fetch products for selected category (or pass empty to fetch all)
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const catRes = await axios.get("/api/rent-lease/category-list");
      const categories = catRes.data.categories || [];
      setAllCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async (categoryId = "") => {
    try {
      setGridLoading(true);
      const productsRes = await axios.get("/api/rent-lease/categorywise-list", {
        params: { id: categoryId },
        withCredentials: true,
      });
      setProperties(productsRes.data.itemList || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setGridLoading(false);
    }
  };

  const fetchCurrency = async () => {
    try {
      const response = await axios.get("/api/get-currency");
      SetCurrency(response.data.currency);
    } catch (error) {
      console.error("Error fetching currency:", error);
    }
  };

  const fetchPriceRange = async () => {
    try {
      const res = await axios.get("/api/rent-lease/price-range");
      console.log("Price range fetched:", res.data);
      setPriceRangeOptions(res.data?.ranges || []);
    } catch (error) {
      console.error("Error fetching price ranges:", error);
    }
  };

  const isSearchEnabled =
    location.trim() !== "" ||
    priceRange.trim() !== "" ||
    bedrooms.trim() !== "" ||
    searchTerm.trim() !== "";

  const categoryButtons = useMemo(() => {
    return allCategories.length > 0 ? (
      allCategories.map((cat) => (
        <button
          key={cat.id}
          className={`btn btn-sm px-4 py-2 ${
            selectedCategory === cat.id ? "btn-danger" : "btn-outline-danger"
          } shadow-sm`}
          onClick={() => handleClick(cat.name, cat.id)}
        >
          {cat.name}
        </button>
      ))
    ) : (
      <button
        className="btn btn-sm px-4 py-2 btn-outline-danger shadow-sm"
        disabled
      >
        Loading Categories...
      </button>
    );
  }, [allCategories, selectedCategory]);

  const handleSearch = async () => {
    try {
      setGridLoading(true);
      const res = await axios.get("/api/rent-lease/search-room", {
        params: {
          categoryId: selectedCategory,
          location,
          priceRange,
          bedrooms,
        },
        withCredentials: true,
      });
      setProperties(res.data.data);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setGridLoading(false);
    }
  };

  0;

  const handleClick = (categoryName, categoryId) => {
    const slug = encodeURIComponent(
      categoryName.toLowerCase().replace(/\s+/g, "-")
    );
    const scrollY = window.scrollY;

    // Update state and fetch products
    setSelectedCategory(categoryId);
    fetchProducts(categoryId);

    // Use router.replace to avoid adding to history stack
    //  router.replace(`/buy-sell/${slug}/${categoryId}`, { scroll: false });

    // Restore scroll position
    window.scrollTo(0, scrollY);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(id);
    fetchPriceRange();
    fetchCurrency();
  }, [id]);

  return (
    <>
      <Header />
      <OtherBanner
        page_title={category}
        banner_image="/assets/images/bg/rent.jpg"
      />

      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <div className="profile-info col-md-12">
              {/* Category Buttons */}
              <div className="mb-4 text-center">
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {categoryButtons}
                </div>
              </div>

              {/* Search Panel */}
              <div className="container mb-4">
                <div className="card shadow-sm border-0 p-4">
                  <h5 className="mb-3 fw-bold text-center">
                    Search Properties
                  </h5>

                  <div className="d-flex justify-content-center">
                    <form className="row g-3 w-100">
                      <div className="col-md-4">
                        <label htmlFor="location" className="form-label">
                          Location
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="location"
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                          }}
                          placeholder="Enter city or area"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="priceRange" className="form-label">
                          Price Range
                        </label>
                        <select
                          className="form-select"
                          id="priceRange"
                          value={priceRange}
                          onChange={(e) => setPriceRange(e.target.value)}
                        >
                          <option value="">Select</option>
                          {priceRangeOptions.map((range, index) => (
                            <option key={index} value={range.value}>
                              {currency}
                              {range.label1} - {currency}
                              {range.label2}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="bedrooms" className="form-label">
                          Bedrooms
                        </label>
                        <select
                          className="form-select"
                          id="bedrooms"
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.25rem 0.5rem",
                          }}
                          onChange={(e) => setBedrooms(e.target.value)}
                        >
                          <option value="">Any</option>
                          <option value="1">1 Bedroom</option>
                          <option value="2">2 Bedrooms</option>
                          <option value="3+">3+ Bedrooms</option>
                        </select>
                      </div>

                      <div className="col-md-2 d-flex align-items-end">
                        <div className="d-flex gap-2 w-100">
                          <button
                            className="btn btn-danger w-50"
                            type="button"
                            onClick={handleSearch}
                            disabled={!isSearchEnabled}
                          >
                            Search
                          </button>
                          <button
                            className="btn btn-outline-secondary w-50"
                            type="button"
                            onClick={handleClear}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Property Listings */}
              <div className="container my-5">
                {gridLoading ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "300px" }}
                  >
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">
                        Loading products...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {properties.length === 0 ? (
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
                          <h4 className="fw-bold text-muted">No Items Found</h4>
                          <p className="text-secondary">
                            Sorry, we couldn't find any items in this category.
                          </p>
                        </div>
                      </div>
                    ) : (
                      properties.map((property, idx) => (
                        <div className="col-md-4 mb-4" key={idx}>
                          <div
                            className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative"
                            style={{
                              transition:
                                "transform 0.3s ease, box-shadow 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-5px)";
                              e.currentTarget.style.boxShadow =
                                "0 8px 20px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(0,0,0,0.1)";
                            }}
                          >
                            {/* Image Section */}
                            <div
                              className="position-relative"
                              onClick={() =>
                                router.push(
                                  `/user/rent-lease/details/${property.id}`
                                )
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <img
                                src={property.images?.[0]}
                                className="card-img-top"
                                alt={property.title}
                                style={{
                                  height: "250px",
                                  objectFit: "cover",
                                  transition: "transform 0.4s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform =
                                    "scale(1.05)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = "scale(1)")
                                }
                              />
                              {property.images &&
                                property.images.length > 1 && (
                                  <span
                                    className="badge bg-dark position-absolute top-0 end-0 m-2 rounded-pill"
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    +{property.images.length - 1} Photos
                                  </span>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="card-body text-center">
                              <h5 className="card-title fw-bold text-truncate">
                                {property.title.length > 30
                                  ? property.title.slice(0, 30) + "..."
                                  : property.title}
                              </h5>

                              <p className="text-muted mb-1 small">
                                <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
                                {property.location
                                  ?.split(" ")
                                  .slice(0, 6)
                                  .join(" ")}
                                {property.location?.split(" ").length > 6 &&
                                  "..."}
                              </p>

                              {/* <p className="card-text text-secondary small">
                                {property.shortDesc
                                  ? property.shortDesc
                                      .split(" ")
                                      .slice(0, 10)
                                      .join(" ") +
                                    (property.shortDesc.split(" ").length > 10
                                      ? "..."
                                      : "")
                                  : ""}
                              </p> */}

                              <p className="fw-bold fs-5 text-success mb-3">
                                {property.currency}
                                {property.price}/
                                {property.frequency.charAt(0).toUpperCase() +
                                  property.frequency.slice(1)}
                              </p>

                              <button
                                className="btn btn-primary rounded-pill px-4 py-2"
                                onClick={() =>
                                  router.push(
                                    `/user/rent-lease/details/${property.id}`
                                  )
                                }
                                style={{
                                  background: "#c12020",
                                  border: "none",
                                }}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Floating SOS Button */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListHomes;
