"use client";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import axios from "axios";
import AlertService from "../components/alertService";
const AddMarketItemModel = ({ show, onClose, itemData, onItemAdded }) => {

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    city: "",
    state: "",
    location: "",
    quantity: "",
    unit: "",
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currency,SetCurrency]=useState("");
  const Required = () => <span className="text-danger">*</span>;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/marketplace/category-list");
        setCategories(response.data.categories);
        // console.log("Categories fetched:", response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

         const fetchCurrency=async ()=>{

      try{
        const response=await axios.get("/api/get-currency");
        SetCurrency(response.data.currency);

      }catch(error){
      console.error("Error fetching currency:", error);
      }
    }
    fetchCurrency();
    fetchCategories();
  }, []);



  const validateForm = () => {
    const {
      title,
      price,
      description,
      images,
      category,
      city,
      state,
      location,
      unit,
      quantity,
    } = formData;

    if (!title) {
      AlertService.error("Title is required");
      return false;
    }

    if (!category) {
      AlertService.error("Category is required");
      return false;
    }
    if (!price) {
      AlertService.error("Price is required");
      return false;
    }

        if (!price || parseFloat(price) <= 0) {
  AlertService.error("Price must be greater than 0");
  return false;
}

    if (!quantity) {
      AlertService.error("Quantity is required");
      return false;
    }

    if (!unit) {
      AlertService.error("Unit Description is required");
      return false;
    }
 

    if (!location) {
      AlertService.error("Address is required");
      return false;
    }

    if (images.length === 0) {
      AlertService.error("Please upload at least one image");
      return false;
    }

    return true;
  };
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "price") {
      if (!/^\d*\.?\d*$/.test(value)) return;
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (name === "quantity") {
      if (!/^\d*\.?\d*$/.test(value)) return;
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (name === "images" && files.length > 0) {
      const newFiles = Array.from(files);

      // Filter duplicates by name
      const existingNames = new Set(formData.images.map((f) => f.name));
      const filteredNewFiles = newFiles.filter(
        (file) => !existingNames.has(file.name)
      );

      const updatedImages = [...formData.images, ...filteredNewFiles];

      // Revoke old preview URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));

      // Create new previews
      const newPreviews = updatedImages.map((file) =>
        URL.createObjectURL(file)
      );

      setFormData((prev) => ({ ...prev, images: updatedImages }));
      setImagePreviews(newPreviews);

      // ✅ Clear file input so selecting same file again works
      e.target.value = "";
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = (index) => {
    // Clean up old object URL
    URL.revokeObjectURL(imagePreviews[index]);

    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);

    setFormData((prev) => ({ ...prev, images: updatedImages }));
    setImagePreviews(updatedImages.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setLoading(false);
      return;
    }
  setLoading(true);
    const {
      title,
      price,
      description,
      images,
      category,
      city,
      state,
      location,
      unit,
      quantity,
    } = formData;

    const data = new FormData();
    data.append("title", title);
    data.append("price", price);
    data.append("description", description);
    data.append("category", category);

    data.append("location", location);
    data.append("unit", unit);
    data.append("quantity", quantity);
    images.forEach((img) => data.append("images", img));
    try {
      const response = await axios.post(
        "/api/marketplace/create-product",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      AlertService.success(response.data.msg);

      setFormData({
        title: "",
        price: "",
        description: "",
        images: [],
        shortDesc: "",
        category: "",
        city: "",
        state: "",
        location: "",
        unit: "",
        quantity: "",
      });
      setImagePreviews([]);
      onClose();
      if (typeof onItemAdded === "function") {
        onItemAdded();
      }
    } catch (error) {
      console.error("❌ Error uploading product:", error);
        AlertService.error(response.data.msg);
    } finally {
      setLoading(false); // re-enable button after process
    }
  };
  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      description: "",
      images: [],
      shortDesc: "",
      category: "",
      city: "",
      state: "",
      location: "",
      unit: "",
      quantity: "",
    });
    setImagePreviews([]);
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        resetForm();
        onClose();
      }}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-semibold fs-4">🛠️ Add Item</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-white">
        <Form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="p-3"
        >
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Title <Required />
            </Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Chicken Biryani"
              className="rounded-3 shadow-sm"
            />
          </Form.Group>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Category <Required />
                </Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="rounded-3 shadow-sm"
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Price ({currency}) <Required />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 4999"
                  className="rounded-3 shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Quantity <Required />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  className="rounded-3 shadow-sm"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Unit <Required />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g. Plate, Bowl,Piece etc."
                  className="rounded-3 shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>
{/* 
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  City <Required />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Houston"
                  className="rounded-3 shadow-sm"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  State <Required />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. New Jersey"
                  className="rounded-3 shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row> */}

          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Address <Required />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. 721 Broadway, New York, NY 10003, USA"
                  className="rounded-3 shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Description of the property..."
              className="rounded-3 shadow-sm"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Upload Images <Required />
            </Form.Label>

            {/* Hidden native input */}
            <Form.Control
              type="file"
              id="imageUpload"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="d-none" // hides input
            />

            {/* Custom trigger button */}
            <label
              htmlFor="imageUpload"
              className="btn btn-outline-secondary rounded-3 ml-3 shadow-sm"
            >
              Choose Images
            </label>

            {/* Optional: show file count or names */}
            {formData.images.length > 0 && (
              <div className="mt-2 small text-muted">
                {formData.images.length} file(s) selected
              </div>
            )}
          </Form.Group>

          {imagePreviews.length > 0 && (
            <div className="d-flex flex-wrap gap-3 mt-3">
              {imagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="position-relative"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-100 h-100 object-fit-cover"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute"
                    style={{
                      top: "1px",
                      right: "1px",
                      width: "28px", // Ensure equal width & height
                      height: "28px !important",
                      fontSize: "14px",
                      borderRadius: "100%", // Fully round
                      boxShadow: "0 0 4px rgba(0,0,0,0.2)",
                    }}
                    onClick={() => handleRemoveImage(idx)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button
              type="submit"
              disabled={loading}
              style={{
                background: "#c12020",
                color: "#fff",
                border: "none",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              className="px-4 py-2 fw-medium rounded-pill d-flex align-items-center justify-content-center gap-2"
            >
              {loading && (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddMarketItemModel;
