"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import Sidebar from "@/app/components/Sidebar";
import { useState } from "react";
import axios from "axios";
import AlertService from "@/app/components/alertService";
import useUserStore from "@/app/store/useUserStore";


const ChangeProfileImage = () => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setProfileImage } = useUserStore();

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      AlertService.error("Please select an image first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.put(
        "/api/auth/profile-img",
        formData,
        {
          withCredentials: true, // ✅ ensures cookies are sent
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res) {
        AlertService.success("Profile image updated successfully!");
        setProfileImage(res.data.image); // ✅ update Zustand
      } else {
        AlertService.error(res.data.message || "Something went wrong.");
      }
    } catch (err) {
      AlertService.error(
        err.response?.data?.message || "Failed to upload image."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <OtherBanner page_title="Change Profile Image" />

      <section className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <Sidebar />

            <div className="col-md-9">
              <form
                method="post"
                onSubmit={handleSubmit}
                className="tm-form tm-login-form tm-form-bordered form-card"
                encType="multipart/form-data"
              >
                <h4
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    textDecoration: "underline",
                    marginBottom: "20px",
                  }}
                >
                  Change Profile Image
                </h4>

                <div className="tm-form-inner">
                  <div className="row col-md-12">
                    <div className="col-md-9">
                      <div className="tm-form-field mb-3">
                        <label htmlFor="profile_image" className="mb-2">
                          Select New Profile Image <span className="text-danger">*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="profile_image"
                          id="profile_image"
                          accept="image/*"
                          onChange={handleImageChange}
                      
                        />
                      </div>

                      {preview && (
                        <div className="mb-4 text-center">
                          <p>Image Preview:</p>
                          <img
                            src={preview}
                            alt="Preview"
                            style={{
                              maxWidth: "150px",
                              borderRadius: "50%",
                              
                            }}
                          />
                        </div>
                      )}

                      <div className="tm-form-field text-center">
                        <button
                          type="submit"
                          className="btn btn-danger px-4"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Profile Image"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ChangeProfileImage;
