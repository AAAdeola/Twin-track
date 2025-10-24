import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit3, FiBox, FiSearch, FiFilter } from "react-icons/fi";
import Sidebar from "../Sidebar/Sidebar";
import AddMaterialModal from "../AddMaterialModal/AddMaterialModal";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./MaterialsInventory.css";

const MaterialsInventory = () => {
  const [materials, setMaterials] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | low | adequate

  // Add new material
  const handleAddMaterial = (newMaterial) => {
    setMaterials((prev) => [...prev, newMaterial]);
    setShowAddModal(false);
  };

  // Increase quantity
  const handleIncrease = (material) => {
    const updated = materials.map((m) =>
      m.name === material.name ? { ...m, quantity: m.quantity + 1 } : m
    );
    setMaterials(updated);
  };

  // Delete material (after confirmation)
  const handleDeleteConfirm = () => {
    setMaterials(materials.filter((m) => m.name !== selectedMaterial.name));
    setShowConfirm(false);
  };

  // Filter + search logic
  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch = mat.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "low"
        ? mat.quantity < 5
        : mat.quantity >= 5;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="materials-page">
      <Sidebar />

      <main className="materials-main">
        <header className="materials-header">
          <h2>Materials Inventory</h2>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Add Material
          </button>
        </header>

        {/* 🔍 Search + Filter Controls */}
        <div className="search-filter-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <FiFilter className="filter-icon" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="low">Low Stock (&lt; 5)</option>
              <option value="adequate">Adequate Stock (≥ 5)</option>
            </select>
          </div>
        </div>

        {/* 📦 Materials List */}
        <section className="materials-grid">
          {filteredMaterials.length === 0 ? (
            <p className="no-materials">No materials match your search/filter.</p>
          ) : (
            filteredMaterials.map((mat, index) => (
              <div className="material-card" key={index}>
                <div className="material-img">
                  {mat.image ? (
                    <img src={mat.image} alt={mat.name} />
                  ) : (
                    <FiBox className="default-icon" />
                  )}
                </div>

                <h4>{mat.name}</h4>
                <p>
                  Quantity: <strong>{mat.quantity}</strong>
                </p>

                <div className="material-actions">
                  <button
                    className="increase-btn"
                    onClick={() => handleIncrease(mat)}
                  >
                    <FiEdit3 /> Increase
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => {
                      setSelectedMaterial(mat);
                      setShowConfirm(true);
                    }}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* ➕ Add Material Modal */}
        {showAddModal && (
          <AddMaterialModal
            onClose={() => setShowAddModal(false)}
            onAddMaterial={handleAddMaterial}
          />
        )}

        {/* 🗑️ Confirm Delete Modal */}
        {showConfirm && selectedMaterial && (
          <ConfirmDialog
            title="Delete Material"
            message={`Are you sure you want to delete "${selectedMaterial.name}"?`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </main>
    </div>
  );
};

export default MaterialsInventory;
