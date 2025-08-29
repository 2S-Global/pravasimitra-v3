"use client";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import AlertService from "../components/alertService";
const EditItemModal = ({ show, onClose, itemData, onItemAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    images: [],
    category: "",
    city: "",
    state: "",
    location:""
  });
  const [submiting, setSubmiting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currency,SetCurrency]=useState("");
  useEffect(() => {
    const fetchAndSet = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/product/category-list");
        const cats = res.data.categories || [];
        setCategories(cats);

        if (itemData) {
          const selectedCategory =
            typeof itemData.category === "object"
              ? itemData.category._id || itemData.category.id
              : itemData.category || "";

          setFormData({
            title: itemData.title || "",
            price: itemData.price || "",
            description: itemData.description || "",
            category: selectedCategory,
            city: itemData.city || "",
            state: itemData.state || "",
            shortDesc: itemData.shortDesc || "",
            images: [],
        location  : itemData.location || "",
        currency:itemData.currency|| "",

          });

          const gallery = itemData.gallery || [];
          setExistingImages(gallery);
          setImagePreviews(
            gallery.map((url) => ({
              url,
              isExisting: true,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false); // stop loading after everything
      }
    };
    
  

    if (itemData) {
      fetchAndSet();
    }
    
  }, [itemData]);

  const Required = () => <span className="text-danger">*</span>;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "price") {
      if (!/^\d*\.?\d*$/.test(value)) return;
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (name === "images" && files.length > 0) {
      const newFiles = Array.from(files);

      const existingFileNames = new Set(formData.images.map((f) => f.name));
      const filteredNewFiles = newFiles.filter(
        (file) => !existingFileNames.has(file.name)
      );

      const updatedImages = [...formData.images, ...filteredNewFiles];
      setFormData((prev) => ({ ...prev, images: updatedImages }));

      setImagePreviews((prev) => [
        ...prev,
        ...filteredNewFiles.map((file) => ({
          url: URL.createObjectURL(file),
          isExisting: false,
          file,
        })),
      ]);

      // ✅ Reset input value so same files can be reselected
      e.target.value = null;
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      const updated = [...existingImages];
      updated.splice(index, 1);
      setExistingImages(updated);

      // Remove corresponding existing preview
      let existingIndex = -1;
      let count = -1;
      setImagePreviews((prev) =>
        prev.filter((img) => {
          if (img.isExisting) {
            count++;
            if (count === index) {
              existingIndex = count;
              return false;
            }
          }
          return true;
        })
      );
    } else {
      const updated = [...formData.images];
      updated.splice(index, 1);
      setFormData((prev) => ({ ...prev, images: updated }));

      // Remove corresponding new preview
      let newIndex = -1;
      let count = -1;
      setImagePreviews((prev) =>
        prev.filter((img) => {
          if (!img.isExisting) {
            count++;
            if (count === index) {
              newIndex = count;
              return false;
            }
          }
          return true;
        })
      );
    }
  };

  const validateForm = () => {
    const { title, price, description, images, category, city, state } =
      formData;

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
    // if (!city) {
    //   AlertService.error("City is required");
    //   return false;
    // }

    // if (!state) {
    //   AlertService.error("State is required");
    //   return false;
    // }
    const hasNewImages = images.length > 0;
    const hasExistingImages = existingImages.length > 0;

    if (!hasNewImages && !hasExistingImages) {
      AlertService.error("Please upload at least one image");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmiting(false);
      return;
    }

    try {
      const {
        title,
        price,
        description,
        images,
        category,
        city,
        shortDesc,
        state,
        location
      } = formData;

      const data = new FormData();
      data.append("id", itemData.id); // Make sure to include the item's ID
      data.append("title", title);
      data.append("price", price);
      data.append("description", description);
      data.append("category", category);

      data.append("shortDesc", shortDesc);

      data.append("location", location);

      // ✅ Append new image files
      images.forEach((img) => {
        data.append("images", img);
      });

      // ✅ Append existing image URLs
      data.append("existingImageRaw", JSON.stringify(existingImages));

      setSubmiting(true);

      const response = await axios.patch("/api/product/edit-product", data, {
        headers: {},
        withCredentials: true,
      });

      AlertService.success(response.data.msg);
      setSubmiting(false);
      onClose();
      if (typeof onItemAdded === "function") {
        onItemAdded();
      }
    } catch (error) {
      console.error("Edit error:", error);
      AlertService.error(
        error?.response?.data?.msg || "Something went wrong."
      );
      setSubmiting(false);
    }
  };

  const imageBoxStyle = {
    position: "relative",
    width: "100px",
    height: "100px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  };

  const closeBtnStyle = {
    position: "absolute",
    top: "4px",
    right: "4px",
    borderRadius: "50%",
    padding: "0px 5px",
    lineHeight: "1",
    fontSize: "14px",
    color: "#dc3545",
    backgroundColor: "#ffffff",
    border: "1px solid #dee2e6",
    boxShadow: "0 0 3px rgba(0,0,0,0.1)",
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header
        closeButton
        style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}
      >
        <Modal.Title className="fw-semibold text-primary">
          ✏️ Edit Item
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading item details...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                {" "}
                Title <Required />
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Wooden Study Table"
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
                    Price {formData.currency ? `(${formData.currency})` : ""} <Required />
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

            {/* <Row className="mb-4">
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
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Short Description</Form.Label>
              <Form.Control
                as="textarea"
                name="shortDesc"
                rows={2}
                value={formData.shortDesc}
                onChange={handleChange}
                placeholder="Short description about the item..."
                className="rounded-3 shadow-sm"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter item description"
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

            {existingImages.length > 0 && (
              <>
                <p className="fw-bold mt-3">Existing Images</p>
                <div className="d-flex gap-2 flex-wrap">
                  {existingImages.map((src, idx) => (
                    <div key={idx} style={imageBoxStyle}>
                      <img
                        src={src}
                        alt={`Existing ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                      <Button
                        variant="light"
                        size="sm"
                        style={closeBtnStyle}
                        onClick={() => handleRemoveImage(idx, true)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {imagePreviews.filter((img) => !img.isExisting).length > 0 && (
              <>
                <p className="fw-bold mt-4">🆕 New Image Previews</p>
                <div className="d-flex gap-2 flex-wrap">
                  {imagePreviews
                    .filter((img) => !img.isExisting)
                    .map((img, idx) => (
                      <div key={idx} style={imageBoxStyle}>
                        <img
                          src={img.url}
                          alt={`New Preview ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "12px",
                          }}
                        />
                        <Button
                          variant="light"
                          size="sm"
                          style={closeBtnStyle}
                          onClick={() => handleRemoveImage(idx, false)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                </div>
              </>
            )}

            <div className="text-end">
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
                className="mt-4 px-4 py-2 fw-medium rounded-pill mt-5 mb-2"
              >
                {submiting && (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
                {submiting ? "Updating..." : "Update"}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditItemModal;
