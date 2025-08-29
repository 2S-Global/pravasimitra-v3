"use client";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
import ContactModal from "@/app/components/ContactModal";
import AddRoomModel from "@/app/components/AddRoomModel";
import EditRoomModal from "@/app/components/EditRoomModal";
import AlertService from "@/app/components/alertService";
import axios from "axios";
import { useRouter } from "next/navigation";

const ContactedUsersList = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemContacts, setSelectedItemContacts] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency,SetCurrency]=useState("");
     const router = useRouter();
  const handleViewDetails = (itemName, contacts) => {
    setSelectedItemName(itemName);
    setSelectedItemContacts(contacts);

    setShowModal(true);
  };

const handleAdd = async () => {
  try {
    const res = await axios.get("/api/membership/status", {
      withCredentials: true, // ✅ token comes from cookie
    });

    const remaining = res.data?.data?.remaining?.rentLease ?? 0;

    if (remaining <= 0) {
      AlertService.error(
        "You have reached your Rent/Lease post limit. Please upgrade your package to continue."
      );
      router.replace("/user/upgrade-membership");
    } else {
      setShowAddModal(true); // ✅ open modal only if allowed
    }
  } catch (err) {
    console.error("Error checking membership:", err);
    AlertService.error("Something went wrong. Please try again later.");
    router.replace("/user/upgrade-membership");
  }
};
  const handleEdit = (item) => {
    setItemToEdit({
      title: item.title || "",
      price: item.price || "",
      description: item.description || "" ,
      shortDesc: item.shortDesc || "",
      images: item.images || "",
      propertyType: item.propertyType.id || "",
      roomSize: item.roomSize || "",
      frequency: item.frequency || "",
      location: item.location || "",
      bathrooms: item.bathrooms || "" ,
      furnished: item.furnished || "",
      id: item.id,
      bedrooms: item.bedrooms || "",
      amenities: item.amenities || "",
     city: item.city || "",
      state: item.state || "",
      currency:item.currency||""
    });
    setShowEditModal(true);
  };

    const handleDelete = async (id) => {
    AlertService.confirm(
      "Remove Item",
      "Are you sure you want to remove this item?",
      async () => {
        try {
          const response = await axios.patch("/api/rent-lease/delete-room", {
            id,
          });

          AlertService.success("Property removed successfully!");
          setUsers((prevUsers) => prevUsers.filter((item) => item.id !== id));
        } catch (error) {
          console.error("Error deleting:", error);
          AlertService.error("Failed to remove item.");
        }
      },
      () => {
        AlertService.message("Item not removed");
      }
    );
  };

  const filteredUsers = users;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/rent-lease/list-room");

      setUsers(response.data.items);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchUsers();

  }, []);

  return (
    <>
      <Header />
      <OtherBanner page_title="Rent & Lease" />

      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            {/* <Sidebar /> */}

            <div className="profile-info col-md-12">
              <form className="tm-form tm-login-form tm-form-bordered form-card">
                <h4
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                >
                  My Posts
                </h4>

                <div className="container my-4">
                  {/* Add New Button */}
                      <div className="mb-5 text-end d-flex justify-content-end gap-2">

                            <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => router.push("/user/rent-lease/buyer-list")
                      }
                    >
                      <i className="bi bi-list-check me-1" /> My Apply
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary "
                      onClick={handleAdd}
                      style={{
                        background: "#c12020",
                        color: "#fff",
                        border: "#c12020",
                      }}
                    >
                      <i className="bi bi-plus-lg me-1" /> Add New Property
                    </button>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-striped align-middle text-center">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Property Title</th>
                          <th>Room Image</th>
                          <th>Property Type</th>
                          <th>Price</th>
                          <th>Room Size (<strong>sqft</strong>)</th>
                          <th>Date Posted</th>
                          <th>Interested Users</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="10">
                              <div
                                className="d-flex justify-content-center align-items-center"
                                style={{ minHeight: "200px" }}
                              >
                                <div
                                  className="spinner-border text-danger"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : filteredUsers.length > 0 ? (
                          filteredUsers.map((user, index) => (
                            <tr key={user.id}>
                              <td>{index + 1}</td>
                              <td>
                                {user.title.split(" ").length > 12
                                  ? user.title
                                      .split(" ")
                                      .slice(0, 12)
                                      .join(" ") + "..."
                                  : user.title}
                              </td>
                              <td>
                                <img
                                  src={user?.images?.[0]}
                                  alt="User"
                                  width={80}
                                  height={60}
                                  style={{ objectFit: "cover" }}
                                />
                              </td>
                              <td>{user.propertyType?.name || "N/A"}</td>
                              <td><strong>{user.currency}</strong>{user.price}</td>
                              <td>{user.roomSize} </td>

                              <td>
                                {new Date(user.createdAt).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>

                              <td>
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  title="View Details"
                                  type="button"
                                  onClick={() =>
                                    handleViewDetails(user.title, user.contacts)
                                  }
                                >
                                  {user.contactCount}
                                </button>
                              </td>
                              <td>
                                <div className="d-flex justify-content-center gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-warning "
                                    title="Edit"
                                    type="button"
                                    onClick={() => handleEdit(user)}
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>

                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete"
                                    type="button"
                                    onClick={() => handleDelete(user.id)}
                                  >
                                    <i className="bi bi-trash" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="text-center text-muted">
                              No Room found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Floating Button */}
    

                <ContactModal
                  show={showModal}
                  onClose={() => setShowModal(false)}
                  contacts={selectedItemContacts}
                  itemName={selectedItemName}
                />

                <AddRoomModel
                  show={showAddModal}
                  onClose={() => setShowAddModal(false)}
                  onItemAdded={fetchUsers}
                />
                <EditRoomModal
                  show={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  itemData={itemToEdit}
                        onItemAdded={fetchUsers}
                  onSave={(formData) => {
                    // You can handle formData submission to your API here
                    console.log("Submit updated item", formData);
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactedUsersList;
