"use client";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import AlertService from "../components/alertService";
const EditRoomModal = ({ show, onClose, itemData, onItemAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    images: [],
    shortDesc: "",
    city: "",
    state: "",
    location: "",
    roomSize: "",
    bedrooms: "",
    bathrooms: "",
    furnished: "",
    amenities: [],
    propertyType: "",
    frequency: "",
  });

  const [categories, setCategories] = useState([]);
  const [amneties, setAmneties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
 const [submiting, setSubmiting] = useState(false);
  const [currency,SetCurrency]=useState("");
  useEffect(() => {
    const fetchAndSet = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/rent-lease/category-list");
        const cats = res.data.categories || [];
        setCategories(cats);

        const response = await axios.get("/api/amenity/list-amenity");
        setAmneties(response.data.amenities);

        // console.log("Fetched items:", itemData);
        if (itemData) {
          setFormData({
            title: itemData.title || "",
            price: itemData.price || "",
            description: itemData.description || "",
            images: [],
            shortDesc: itemData.shortDesc || "",
            city: itemData.city || "",
            state: itemData.state || "",
            location: itemData.location || "",
            roomSize: itemData.roomSize || "",
            bedrooms: itemData.bedrooms || "",
            bathrooms: itemData.bathrooms || "",
            furnished: itemData.furnished || "",
            amenities: itemData.amenities || [], // ✅ ensure string
            propertyType: itemData.propertyType || "",
            frequency: itemData.frequency || "",
            currency:itemData.currency||"",
          });
          const gallery = itemData.images || [];
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
        setLoading(false);
      }
    };

   

    if (itemData) {
      fetchAndSet();
    }

  }, [itemData]); // ✅ useEffect dependency array

  const handleAmenityChange = (e) => {
    const value = String(e.target.value); // ✅ force string
    const isChecked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      amenities: isChecked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value),
    }));
  };
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

  const handleSubmit = async (e) => {
    e.preventDefault();


   if (!validateForm()) {
      setSubmiting(false);
      return;
    }

      setSubmiting(true);
    const {
      title,
      propertyType,
      price,
      bedrooms,
      bathrooms,
      description,
      images,
      roomSize,
      city,
      shortDesc,
      state,
      location,
      furnished,
      amenities,
      frequency,
    } = formData;

    const data = new FormData();
    data.append("title", title);
    data.append("id", itemData.id);
    data.append("price", price);
    data.append("description", description);

    data.append("propertyType", propertyType);
    data.append("bedrooms", bedrooms);
    data.append("bathrooms", bathrooms);
    data.append("roomSize", roomSize);

    data.append("location", location);
    data.append("furnished", furnished);
    data.append("frequency", frequency);
    amenities.forEach((amenityId) => {
      data.append("amenities", amenityId); // send each amenity ID separately
    });

    data.append("existingImageRaw", JSON.stringify(existingImages));

    images.forEach((img) => data.append("images", img));

    try {
      const res = await axios.patch("/api/rent-lease/edit-room", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("Saved successfully:", res.data);
      AlertService.success(res.data.msg);

      // Clear the form after successful patch
      setFormData({
        title: "",
        price: "",
        description: "",
        images: [],
        shortDesc: "",
        city: "",
        state: "",
        location: "",
        roomSize: "",
        bedrooms: "",
        bathrooms: "",
        furnished: "",
        amenities: [],
        propertyType: "",
        frequency: "",
      });
      setImagePreviews([]);
      setExistingImages([]);
        if (typeof onItemAdded === "function") {
        onItemAdded();
      }
      onClose();
    } catch (error) {
      // console.error("Patch request failed:", error);
      AlertService.error("Failed to update property. Please try again.");
    }
    finally{
      setSubmiting(false);
    }
  };

  const validateForm = () => {
    const {
      title,
      propertyType,
      price,
      bedrooms,
      bathrooms,
      description,
      images,
      roomSize,
      city,
      shortDesc,
      state,
      location,
      furnished,
      frequency,
    } = formData;

    if (!title) {
      AlertService.error("Property Title is required");
      return false;
    }

    if (!propertyType) {
      AlertService.error("Property Type is required");
      return false;
    }
    if (!roomSize) {
      AlertService.error("Room Size is required");
      return false;
    }
    if (!frequency) {
      AlertService.error("Frequency is required");
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

    if (!bedrooms) {
      AlertService.error("Bedroom is required");
      return false;
    }
    if (!bathrooms) {
      AlertService.error("Bathroom is required");
      return false;
    }
    if (!furnished) {
      AlertService.error("Furnished is required");
      return false;
    }

    if (!location) {
      AlertService.error("Address is required");
      return false;
    }
    const hasNewImages = images.length > 0;
    const hasExistingImages = existingImages.length > 0;

    if (!hasNewImages && !hasExistingImages) {
      AlertService.error("Please upload at least one image");
      return false;
    }

    return true;
  };

  const Required = () => <span className="text-danger">*</span>;

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
          ✏️ Edit Property
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
            <Form.Label className="fw-semibold">Property Title <Required /></Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter item title"
            />
          </Form.Group>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Property Type <Required />
                </Form.Label>
                <Form.Select
                  name="propertyType"
                  value={formData.propertyType}
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
                  Room Size <Required />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="roomSize"
                  value={formData.roomSize}
                  onChange={handleChange}
                  placeholder="e.g. 950 sq.ft"
                  className="rounded-3 shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Frequency <Required />
                </Form.Label>
                <Form.Select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="rounded-3 shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Price ({formData.currency}) <Required />
                </Form.Label>
                <Form.Control
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 4999"
                  className="rounded-3 shadow-sm"
                   min="1" 
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Bedrooms <Required />
                </Form.Label>
                <Form.Select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="rounded-3 shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Bathrooms <Required />
                </Form.Label>
                <Form.Select
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="rounded-3 shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Furnished <Required />
                </Form.Label>
                <Form.Select
                  name="furnished"
                  value={formData.furnished}
                  onChange={handleChange}
                  className="rounded-3 shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

      

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
            <Form.Label>Amenities</Form.Label>
            <div className="d-flex flex-wrap">
              {amneties.map((amenity) => {
                const amenityId = String(amenity._id); // 💥 force to string
                return (
                  <div
                    key={amenityId}
                    className="me-3 d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <Form.Check
                      type="checkbox"
                      value={amenityId}
                      checked={
                        Array.isArray(formData.amenities) &&
                        formData.amenities.includes(amenityId)
                      }
                      onChange={handleAmenityChange}
                      style={{
                        transform: "scale(0.8)",
                        transformOrigin: "center",
                        marginTop: "-2px", // fine-tune vertical position
                      }}
                    />
                    <label style={{ marginBottom: 0, fontSize: "0.9rem" }}>
                      {amenity.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </Form.Group>

 

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

export default EditRoomModal;
