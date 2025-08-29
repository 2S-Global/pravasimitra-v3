"use client";
import React from "react";
import { Modal, Button, Table, Image } from "react-bootstrap";

const ContactModal = ({ show, onClose, contacts, itemName }) => {
  const defaultImage =
    "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg";
// console.log("contact".contacts);
  return (

    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      className="custom-modal"
    >
      <Modal.Header closeButton className="bg-light border-bottom-0">
        <Modal.Title>
          <h5 className="text-primary mb-0 fw-bold">
            📇 Contacted Users for "{itemName}"
          </h5>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
        {contacts.length > 0 ? (
          <Table
            hover
            responsive
            className="align-middle text-center table-borderless"
          >
            <thead className="bg-primary text-white sticky-top">
              <tr>
                <th>#</th>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => (
 <tr
  key={index}
  className="bg-light shadow-sm mb-2 rounded-3"
  style={{ borderBottom: "1px solid #dee2e6" }}
>
  <td className="align-middle text-center">{index + 1}</td>
  <td className="align-middle" style={{ textAlign: "-webkit-center" }}>
    <Image
      src={contact.image || defaultImage}
      alt={contact.name}
      roundedCircle
      style={{
        objectFit: "cover",
        width: "60px",
        height: "60px",
        border: "2px solid #dee2e6",
      }}
    />
  </td>
  <td className="align-middle text-center">
    {contact.name || <i className="text-muted">N/A</i>}
  </td>
  <td className="align-middle text-center">
    {contact.email || <i className="text-muted">N/A</i>}
  </td>
  <td className="align-middle text-center">
    {contact.phone || <i className="text-muted">N/A</i>}
  </td>
</tr>

              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center text-muted mt-3">
            😕 No contacts found for this item.
          </p>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light border-top-0">
        <Button variant="outline-primary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContactModal;
