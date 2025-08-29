'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import Sidebar from "@/app/components/Sidebar";
import AlertService from "@/app/components/alertService";
import axios from "axios";
import { useCartStore } from "@/app/store/cartStore";

const LocationAlert = dynamic(() => import('@/app/components/LocationAlert'), { ssr: false });


const LocationSettingsPage = () => {
  const [form, setForm] = useState({
    currentCountry: "",
    currentCity: "",
    destinationCountry: "",
    destinationCity: "",
  });

  const [countries, setCountries] = useState([]);
  const [currentCities, setCurrentCities] = useState([]);
  const [destinationCities, setDestinationCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { clearCart } = useCartStore();
  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const res = await axios.get("/api/location/list-country");
      if (Array.isArray(res.data?.items)) setCountries(res.data.items);
    } catch (err) {
      console.error("Error fetching countries:", err);
      AlertService.error("Failed to load countries.");
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchCities = async (countryId, type, preselectCityId = "") => {
    if (!countryId) return;
    try {
      setLoadingCities(true);
      const res = await axios.post("/api/location/get-city", { countryId });
      if (Array.isArray(res.data?.items)) {
        if (type === "current") {
          setCurrentCities(res.data.items);
          if (preselectCityId)
            setForm(prev => ({ ...prev, currentCity: preselectCityId }));
        }
        if (type === "destination") {
          setDestinationCities(res.data.items);
          if (preselectCityId)
            setForm(prev => ({ ...prev, destinationCity: preselectCityId }));
        }
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
      AlertService.error("Failed to load cities.");
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/auth/profile", { withCredentials: true });
      const loc = res.data?.user?.location;
      if (loc) {
        setForm({
          currentCountry: loc.currentCountry?._id || "",
          currentCity: loc.currentCity?._id || "",
          destinationCountry: loc.destinationCountry?._id || "",
          destinationCity: loc.destinationCity?._id || "",
        });

        const promises = [];
        if (loc.currentCountry?._id)
          promises.push(fetchCities(loc.currentCountry._id, "current", loc.currentCity?._id));
        if (loc.destinationCountry?._id)
          promises.push(fetchCities(loc.destinationCountry._id, "destination", loc.destinationCity?._id));
        await Promise.all(promises);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      AlertService.error("Failed to load profile.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCountries();
      await fetchProfile();
      setInitialLoading(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "currentCountry") {
      setForm(prev => ({ ...prev, currentCity: "" }));
      setCurrentCities([]);
      fetchCities(value, "current");
    }

    if (name === "destinationCountry") {
      setForm(prev => ({ ...prev, destinationCity: "" }));
      setDestinationCities([]);
      fetchCities(value, "destination");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentCountry) return AlertService.error("Current Country is required.");
    if (!form.currentCity) return AlertService.error("Current City is required.");
    if (!form.destinationCountry) return AlertService.error("Destination Country is required.");
    if (!form.destinationCity) return AlertService.error("Destination City is required.");

    try {
      setSaving(true);
      const res = await axios.post("/api/location/save-location", form, { withCredentials: true });
      AlertService.success(res.data?.message || "Location settings saved successfully!");
      clearCart();
    } catch (err) {
      console.error("Error saving location:", err);
      AlertService.error(err.response?.data?.message || "Failed to save location settings!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <LocationAlert />
      <OtherBanner page_title="Location Settings" />
      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <Sidebar />
            <div className="profile-info col-md-9">
              {initialLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="tm-form tm-login-form tm-form-bordered form-card">
                  <h4 style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline" }}>Location Settings</h4>
                  <div className="tm-form-inner mt-4">
                    <div className="row col-md-12">
                      <div className="col-md-6">
                        <label>Current Country <span className="text-danger">*</span></label>
                        <select name="currentCountry" value={form.currentCountry} onChange={handleChange} className="form-control" disabled={loadingCountries}>
                          <option value="">-- Select Country --</option>
                          {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label>Current City <span className="text-danger">*</span></label>
                        <select name="currentCity" value={form.currentCity} onChange={handleChange} className="form-control" disabled={!form.currentCountry || loadingCities}>
                          <option value="">-- Select City --</option>
                          {currentCities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="row col-md-12 mt-3">
                      <div className="col-md-6">
                        <label>Destination Country <span className="text-danger">*</span></label>
                        <select name="destinationCountry" value={form.destinationCountry} onChange={handleChange} className="form-control" disabled={loadingCountries}>
                          <option value="">-- Select Country --</option>
                          {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label>Destination City <span className="text-danger">*</span></label>
                        <select name="destinationCity" value={form.destinationCity} onChange={handleChange} className="form-control" disabled={!form.destinationCountry || loadingCities}>
                          <option value="">-- Select City --</option>
                          {destinationCities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <button type="submit" className="btn btn-danger px-4" disabled={saving}>
                        {saving ? "Saving..." : "Save Location Settings"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer /> 
    </>
  );
};

export default LocationSettingsPage;
