"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AlertService from "@/app/components/alertService";

const BuySellCategoryPage = () => {
  const router = useRouter();
  const { category, id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(id || "");
  const [allCategories, setAllCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [gridLoading, setGridLoading] = useState(false);

  const fetchProducts = async (categoryId = "") => {
    try {
      setGridLoading(true);
      const productsRes = await axios.get("/api/product/categorywise-list", {
        params: { id: categoryId },
        withCredentials: true,
      });
      setAllItems(productsRes.data.productList || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setGridLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const catRes = await axios.get("/api/product/category-list");
      const categories = catRes.data.categories || [];
      setAllCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(id);
  }, [id]);

  const handleSearch = async () => {
    try {
      setGridLoading(true);
      const res = await axios.get("/api/product/search-items", {
        params: {
          categoryId: selectedCategory,
          keyword: searchTerm,
        },
        withCredentials: true,
      });
      setAllItems(res.data?.itemList || []);
    } catch (error) {
      console.error("Error searching products:", error);
      AlertService.error("Failed to search products.");
    } finally {
      setGridLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      setSearchTerm("");
      await fetchProducts(selectedCategory);
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  };

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
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        fetchProducts(selectedCategory); // reset when cleared
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory]);

  // Memoize the category buttons to prevent re-rendering
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

  return (
    <>
      <Header />
      <OtherBanner
        page_title={category || "All Furniture"}
        banner_image="/assets/images/bg/furniture_banner.jpg"
      />
      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <div className="profile-info col-md-12">
              {/* 📂 Main Category Filter */}
              <div className="mb-4 text-center">
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {categoryButtons}
                </div>
              </div>

              {/* 🔍 Search Box */}
              <div className="search-panel p-4 mb-3 rounded shadow-sm border bg-light">
                <div className="row g-3 align-items-center">
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <div className="d-flex gap-2">
                      {/* <button
                        className="btn btn-danger w-50"
                        type="button"
                        onClick={handleSearch}
                        disabled={!searchTerm.trim()}
                      >
                        Search
                      </button> */}
                      <button
                        className="btn btn-outline-secondary w-50"
                        type="button"
                        onClick={handleClear}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🪑 Product Grid */}
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
                    {allItems.length === 0 ? (
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
  allItems.map((item, index) => (
  <div className="col-md-4 mb-4" key={index}>
    <div
      className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative"
      style={{
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
    >
      {/* Image Section */}
      <div className="position-relative">
        <img
          src={item.image}
          className="card-img-top"
          alt={item.title}
          style={{
            height: "250px",
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        {item.gallery && item.gallery.length > 1 && (
          <span
            className="badge bg-dark position-absolute top-0 end-0 m-2 rounded-pill"
            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
          >
            +{item.gallery.length - 1} Photos
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body text-center">
        {/* Title */}
        <h5 className="card-title fw-bold text-truncate">
          {item.title.length > 30 ? item.title.slice(0, 30) + "..." : item.title}
        </h5>

        {/* Location */}
        <p className="text-muted mb-1 small">
          <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
          {item.location?.split(" ").slice(0, 6).join(" ")}
          {item.location?.split(" ").length > 6 && "..."}
        </p>

        {/* Short Description */}
        <p className="card-text text-secondary small">
          {item.shortDesc
            ? item.shortDesc.split(" ").slice(0, 12).join(" ") +
              (item.shortDesc.split(" ").length > 12 ? "..." : "")
            : ""}
        </p>

        {/* Price */}
        <p className="fw-bold fs-5 text-success mb-3">
          {item.currency}
          {item.price}
        </p>

        {/* Button */}
        <button
          className="btn btn-primary rounded-pill px-4 py-2"
          onClick={() => router.push(`/user/buy-sell/details/${item.id}`)}
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

              {/* 🚨 Floating SOS Button */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BuySellCategoryPage;
