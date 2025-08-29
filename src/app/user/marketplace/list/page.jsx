"use client";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OtherBanner from "@/app/components/OtherBanner";
// import Sidebar from "@/app/components/Sidebar"
import ContactModal from "@/app/components/ContactModal";
import AddMarketItemModel from "@/app/components/AddMarketItemModel";
import axios from "axios";
import EditMarketItemModal from "@/app/components/EditMarketItemModal";
import AlertService from "@/app/components/alertService";
import { useRouter } from "next/navigation";
const ContactedUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
    const router = useRouter();
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/marketplace/list-product");

      setUsers(response.data.items);

      // console.log("Fetched users:", response.data.items);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false); // end loading
    }
  };


   const handleDelete = async (id) => {
    AlertService.confirm(
      "Remove Item",
      "Are you sure you want to remove this item?",
      async () => {
        try {
          const response = await axios.patch("/api/marketplace/delete-product", {
            id,
          });

          AlertService.success("Item removed successfully!");
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

  const [showModal, setShowModal] = useState(false);
  const [selectedItemContacts, setSelectedItemContacts] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);



const handleAdd = async () => {
  try {
    const res = await axios.get("/api/membership/status", {
      withCredentials: true, // ✅ token comes from cookie
    });

    const remaining = res.data?.data?.remaining?.marketplace ?? 0;

    if (remaining <= 0) {
      AlertService.error(
        "You have reached your MarketPlace post limit. Please upgrade your package to continue."
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
      title: item.title,
      category: item.category.id,
      description: item.description || "",
      price: item.price,
      images: item.images || [],
      category: item.category || "",
      city: item.city || "",
      state: item.state || "",
      location: item.location || "",
      quantity: item.quantity,
      unit: item.unit,
      id: item.id,
      currency:item.currency
    });
    setShowEditModal(true);
  };

  const filteredUsers = users;

  return (
    <>
      <Header />
      <OtherBanner page_title="E-Market Place" />

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
                  <div className="mb-3 text-end">
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
                      <i className="bi bi-plus-lg me-1" /> Add New Item
                    </button>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <table className="table table-striped align-middle text-center">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Item Title</th>
                          <th>Item Image</th>
                          <th>Price</th>
                          <th>Date Posted</th>
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
                                {user.title.split(" ").length > 5
                                  ? user.title
                                      .split(" ")
                                      .slice(0, 5)
                                      .join(" ") + "..."
                                  : user.title}
                              </td>

                              <td style={{ textAlign: "-webkit-center" }}>
                                <img
                                  src={user?.images?.[0]}
                                  alt="User"
                                  width={80}
                                  height={60}
                                  style={{ objectFit: "cover" }}
                                />
                              </td>
                              <td><strong>{user.currency}</strong>{user.price}</td>

                              <td>
                                {new Date(user.createdAt).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>

                              {/* <td>
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  title="View Details"
                                  type="button"
                                  onClick={() =>
                                    handleViewDetails(user.title, user.contacts)
                                  }
                                >
                                  {user.counter}
                                </button>
                              </td> */}
                              <td>
                                <div className="d-flex justify-content-center gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    title="Edit"
                                    type="button"
                                    onClick={() => handleEdit(user)}
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>

                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete"
                                    onClick={() => handleDelete(user.id)}
                                    type="button"
                                  >
                                    <i className="bi bi-trash" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center text-muted">
                              No users found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Floating Button */}


                {/* <ContactModal
                  show={showModal}
                  onClose={() => setShowModal(false)}
                  contacts={selectedItemContacts}
                  itemName={selectedItemName}
                /> */}

                <AddMarketItemModel
                  show={showAddModal}
                  onClose={() => setShowAddModal(false)}
                  onItemAdded={fetchUsers}
                />
                <EditMarketItemModal
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
