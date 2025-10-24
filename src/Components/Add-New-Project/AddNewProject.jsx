import React, { useState } from "react";
import "./AddNewProject.css";

const AddNewProject = ({ onClose, onCreate, availableMaterials = [] }) => {
  const [formData, setFormData] = useState({
    projectName: "",
    projectCode: "",
    description: "",
    status: "Active",
    supervisors: [],
    materials: [],
  });

  const [newSupervisor, setNewSupervisor] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [materialQty, setMaterialQty] = useState("");
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSupervisor = () => {
    if (newSupervisor.trim() !== "") {
      setFormData({
        ...formData,
        supervisors: [...formData.supervisors, newSupervisor.trim()],
      });
      setNewSupervisor("");
    }
  };

  const handleRemoveSupervisor = (name) => {
    setFormData({
      ...formData,
      supervisors: formData.supervisors.filter((sup) => sup !== name),
    });
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial || !materialQty) return;

    const material = availableMaterials.find(
      (m) => m.name === selectedMaterial
    );
    if (!material) return;

    const qty = parseInt(materialQty);
    if (qty <= 0) return;

    const existing = formData.materials.find((m) => m.name === selectedMaterial);
    if (existing) {
      setFormData({
        ...formData,
        materials: formData.materials.map((m) =>
          m.name === selectedMaterial ? { ...m, quantity: qty } : m
        ),
      });
    } else {
      setFormData({
        ...formData,
        materials: [
          ...formData.materials,
          { name: selectedMaterial, quantity: qty },
        ],
      });
    }

    setSelectedMaterial("");
    setMaterialQty("");
  };

  const handleRemoveMaterial = (name) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((m) => m.name !== name),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.projectName.trim() === "") return;

    for (let mat of formData.materials) {
      const stock = availableMaterials.find((m) => m.name === mat.name);
      if (!stock) continue;

      if (mat.quantity > stock.quantity) {
        setError({
          title: "Not Enough Material",
          message: `You requested ${mat.quantity} units of "${mat.name}", but only ${stock.quantity} are available.`,
        });
        return;
      }
    }

    onCreate(formData);
    onClose();
  };

  return (
    <div className="tt-modal-overlay" onMouseDown={onClose}>
      <div
        className="tt-modal-card"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="tt-close" onClick={onClose}>
          ×
        </button>

        <div className="tt-modal-head">
          <h3>Create New Project</h3>
          <p className="muted">Add project details, materials, and supervisors</p>
        </div>

        <form className="tt-form" onSubmit={handleSubmit}>
          <div className="tt-row">
            <label>Project Name</label>
            <input
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="tt-row">
            <label>Project Code</label>
            <input
              name="projectCode"
              value={formData.projectCode}
              onChange={handleChange}
              placeholder="e.g. PRJ-001"
              required
            />
          </div>

          <div className="tt-row">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short project overview"
              rows="3"
            />
          </div>

          <div className="tt-row">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="tt-row">
            <label>Materials</label>
            <div className="material-select">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="">Select material</option>
                {availableMaterials.map((mat, idx) => (
                  <option
                    key={idx}
                    value={mat.name}
                    disabled={mat.quantity <= 0}
                  >
                    {mat.name}{" "}
                    ({mat.quantity > 0
                      ? `Available: ${mat.quantity}`
                      : "Out of stock"})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qty"
                value={materialQty}
                onChange={(e) => setMaterialQty(e.target.value)}
                min="1"
              />

              <button
                type="button"
                className="add-mat-btn"
                onClick={handleAddMaterial}
              >
                Add
              </button>
            </div>

            <ul className="selected-materials">
              {formData.materials.map((mat, idx) => (
                <li key={idx}>
                  {mat.name} - {mat.quantity}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveMaterial(mat.name)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="tt-row">
            <label>Supervisors</label>
            <div className="supervisor-input">
              <input
                value={newSupervisor}
                onChange={(e) => setNewSupervisor(e.target.value)}
                placeholder="Enter supervisor name"
              />
              <button type="button" onClick={handleAddSupervisor}>
                Add
              </button>
            </div>
            <ul className="supervisor-list">
              {formData.supervisors.map((sup, idx) => (
                <li key={idx}>
                  {sup}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveSupervisor(sup)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="tt-actions">
            <button type="button" className="tt-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tt-create">
              Create Project
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div
          className="error-modal-overlay"
          onMouseDown={() => setError(null)}
        >
          <div
            className="error-modal-card"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3>{error.title}</h3>
            <p>{error.message}</p>
            <button onClick={() => setError(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewProject;
