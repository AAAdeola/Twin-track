import React, { useState } from "react";
import { FiX, FiUploadCloud } from "react-icons/fi";
import "./AddMaterialModal.css";

const AddMaterialModal = ({ onClose, onAddMaterial }) => {
  const [materialData, setMaterialData] = useState({
    name: "",
    quantity: "",
    image: null,
    imagePreview: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterialData({ ...materialData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setMaterialData({ ...materialData, image: preview, imagePreview: preview });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!materialData.name || !materialData.quantity) {
      alert("Please fill all required fields.");
      return;
    }

    const newMaterial = {
      name: materialData.name,
      quantity: parseInt(materialData.quantity),
      image: materialData.imagePreview,
    };

    onAddMaterial(newMaterial);
    setMaterialData({ name: "", quantity: "", image: null, imagePreview: null });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Material</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="material-form">
          <div className="form-group">
            <label>Material Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Cement"
              value={materialData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              placeholder="e.g. 50"
              value={materialData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Material Image (optional)</label>
            <div className="upload-box" onClick={() => document.getElementById("materialImage").click()}>
              {materialData.imagePreview ? (
                <img
                  src={materialData.imagePreview}
                  alt="Preview"
                  className="preview-img"
                />
              ) : (
                <div className="upload-placeholder">
                  <FiUploadCloud size={30} />
                  <p>Click to upload image</p>
                </div>
              )}
              <input
                type="file"
                id="materialImage"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Add Material
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;
