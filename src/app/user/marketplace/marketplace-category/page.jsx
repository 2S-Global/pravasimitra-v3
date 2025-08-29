'use client'

import { useRouter } from 'next/navigation'
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import OtherBanner from "@/app/components/OtherBanner"
import axios from "axios";
import { useState, useEffect } from "react";


const MarketPlaceCategory = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


      useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/marketplace/category-list");
        setCategories(res.data.categories);
        // AlertService.success(res.data.msg);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleClick = (categoryName,categoryId) => {
    const slug = encodeURIComponent(categoryName.toLowerCase().replace(/\s+/g, '-'))
    router.push(`/user/marketplace/${slug}/${categoryId}`)
  }



  return (
    <>
      <Header />
      <OtherBanner page_title="Marketplace"  banner_image="/assets/images/bg/marketplace.png" />

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

      <section className="tm-section bg-light py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Explore Categories</h2>
          <div className="row g-4">
            {categories.map(category => (
              <div key={category.id} className="col-12 col-sm-6 col-md-4">
                <div
                  className="category-card d-flex flex-column justify-content-center align-items-center text-center shadow-sm p-4"
                  onClick={() => handleClick(category.name, category.id)}
                  style={{
                    borderRadius: '20px',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    minHeight: '200px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.03)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <img
                    src={category.image}
                    alt={category.label}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'contain',
                      marginBottom: '1rem'
                    }}
                  />
                  <h6 className="fw-semibold mb-0">{category.name}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

          )}
      {/* Floating SOS Button */}
     

      <Footer />
    </>
  )
}

export default MarketPlaceCategory
