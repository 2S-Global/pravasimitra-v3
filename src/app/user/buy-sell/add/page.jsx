'use client'
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useState } from "react";

const AddItem = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    location: "",
    image: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // 🔄 Send to backend here
  };

  return (
    <>
      <Header />
      <div className="tm-section bg-white tm-padding-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow p-4 border-0">
                <h3 className="mb-4 text-center fw-bold text-danger">Add New Item</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Item Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      placeholder="e.g. Luxury Sofa Set"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      placeholder="Describe your item..."
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="bed">Bed</option>
                      <option value="sofa">Sofa</option>
                      <option value="table">Table</option>
                      <option value="chair">Chair</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      placeholder="e.g. 199.99"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">City & State</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Upload Image</label>
                    <input
                      type="file"
                      className="form-control"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-danger py-2">
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddItem;
