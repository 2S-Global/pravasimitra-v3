"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import useUserStore from "@/app/store/useUserStore";
import AlertService from "@/app/components/alertService";
import { Cursor } from "mongoose";

const Sidebar = () => {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {  
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/profile", {
          withCredentials: true, // 👈 reads token from cookies
        });

        if (res.data?.user) {
          setUser(res.data.user); // store full user object in Zustand
        }
      } catch (error) {
        AlertService.error(error.response?.data?.msg || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    if (!user?._id) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user?._id, setUser]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-nav col-md-3">
      <div className="panel">
   <div
  className="user-heading round d-flex flex-column align-items-center text-center"
>
  <img
    src={user.image || "/assets/images/default-user.png"}
    alt="Profile"
    className="rounded-circle"
    style={{
      width: "120px",
      height: "120px",
      objectFit: "cover",
    }}
  />
  <h1 className="mt-3">{user.name || "User"}</h1>
  <p>{user.email || "user@example.com"}</p>
</div>

        <ul className="nav nav-pills nav-stacked">
          {/* <li className="active">
            <Link href="/user/dashboard">
              <i className="fa fa-tachometer-alt" /> Dashboard
            </Link>
          </li> */}

          <li>
            <Link href="/user/my-account">
              <i className="fa fa-user-cog" /> Manage Profile
            </Link>
          </li>

          <li>
            <Link href="/user/profile-image">
              <i className="fa fa-image" /> Change Profile Image
            </Link>
          </li>

          <li>
            <Link href="/user/change-password">
              <i className="fa fa-lock" /> Change Password
            </Link>
          </li>

          <li>
            <Link href="/user/location-settings">
              <i className="fa fa-map-marker-alt" /> Location Settings
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
