import React, { useState } from "react";
import "./UpdateProjectMaterialsModal.css";

const UpdateProjectMaterialsModal = ({
  project,
  availableMaterials = [],
  onUpdate,
  onClose,
}) => {
  const [newMaterial, setNewMaterial] = useState("");
  const [newMaterialQty, setNewMaterialQty] = useState("");
  const [increaseMaterial, setIncreaseMaterial] = useState("");
  const [increaseQty, setIncreaseQty] = useState("");
  const [materialsToUpdate, setMaterialsToUpdate] = useState([]);
  const [error, setError] = useState(null);

  const projectMaterials = project.materials || [];

  const unusedMaterials = availableMaterials.filter(
    (mat) => !projectMaterials.some((pm) => pm.name === mat.name)
  );

  const handleAddNewMaterial = () => {
    if (!newMaterial || !newMaterialQty) return;

    const qty = parseInt(newMaterialQty);
    if (qty <= 0) return;

    const material = availableMaterials.find((m) => m.name === newMaterial);
    if (!material) return;

    if (qty > material.quantity) {
      setError({
        title: "Not Enough Material",
        message: `You tried to add ${qty} units of "${newMaterial}", but only ${material.quantity} are available.`,
      });
      return;
    }

    const existing = materialsToUpdate.find((m) => m.name === newMaterial);
    if (existing) {
      setMaterialsToUpdate(
        materialsToUpdate.map((m) =>
          m.name === newMaterial ? { ...m, quantity: m.quantity + qty } : m
        )
      );
    } else {
      setMaterialsToUpdate([
        ...materialsToUpdate,
        { name: newMaterial, quantity: qty },
      ]);
    }

    setNewMaterial("");
    setNewMaterialQty("");
  };

  const handleIncreaseExisting = () => {
    if (!increaseMaterial || !increaseQty) return;

    const qty = parseInt(increaseQty);
    if (qty <= 0) return;

    const material = availableMaterials.find((m) => m.name === increaseMaterial);
    if (!material) return;

    if (qty > material.quantity) {
      setError({
        title: "Insufficient Stock",
        message: `You tried to increase "${increaseMaterial}" by ${qty}, but only ${material.quantity} are available.`,
      });
      return;
    }

    const existing = materialsToUpdate.find((m) => m.name === increaseMaterial);
    if (existing) {
      setMaterialsToUpdate(
        materialsToUpdate.map((m) =>
          m.name === increaseMaterial
            ? { ...m, quantity: m.quantity + qty }
            : m
        )
      );
    } else {
      setMaterialsToUpdate([
        ...materialsToUpdate,
        { name: increaseMaterial, quantity: qty, increase: true },
      ]);
    }

    setIncreaseMaterial("");
    setIncreaseQty("");
  };

  const handleRemoveMaterial = (name) => {
    setMaterialsToUpdate(materialsToUpdate.filter((m) => m.name !== name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (materialsToUpdate.length === 0) return;

    for (let mat of materialsToUpdate) {
      const stock = availableMaterials.find((m) => m.name === mat.name);
      if (stock && mat.quantity > stock.quantity) {
        setError({
          title: "Insufficient Stock",
          message: `You requested ${mat.quantity} units of "${mat.name}", but only ${stock.quantity} are available.`,
        });
        return;
      }
    }

    onUpdate(materialsToUpdate);
    onClose();
  };

  return (
    <div className="tt-modal-overlay" onMouseDown={onClose}>
      <div
        className="tt-modal-card large"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="tt-close" onClick={onClose}>
          ×
        </button>

        <div className="tt-modal-head">
          <h3>Update Materials for {project.projectName}</h3>
          <p className="muted">
            Add new materials or increase existing ones while ensuring stock
            availability.
          </p>
        </div>

        <form className="tt-form" onSubmit={handleSubmit}>
          <h4 className="section-title">➕ Add New Materials</h4>
          <div className="tt-row">
            <div className="material-select">
              <select
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
              >
                <option value="">Select material</option>
                {unusedMaterials.length > 0 ? (
                  unusedMaterials.map((mat, idx) => (
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
                  ))
                ) : (
                  <option disabled>No new materials available</option>
                )}
              </select>

              <input
                type="number"
                placeholder="Qty"
                min="1"
                value={newMaterialQty}
                onChange={(e) => setNewMaterialQty(e.target.value)}
              />
              <button
                type="button"
                className="add-mat-btn"
                onClick={handleAddNewMaterial}
              >
                Add
              </button>
            </div>
          </div>

          <h4 className="section-title">⬆️ Increase Existing Materials</h4>
          <div className="tt-row">
            <div className="material-select">
              <select
                value={increaseMaterial}
                onChange={(e) => setIncreaseMaterial(e.target.value)}
              >
                <option value="">Select existing material</option>
                {projectMaterials.length > 0 ? (
                  projectMaterials.map((mat, idx) => (
                    <option key={idx} value={mat.name}>
                      {mat.name} (Current: {mat.quantity})
                    </option>
                  ))
                ) : (
                  <option disabled>No materials in this project</option>
                )}
              </select>

              <input
                type="number"
                placeholder="Qty to add"
                min="1"
                value={increaseQty}
                onChange={(e) => setIncreaseQty(e.target.value)}
              />
              <button
                type="button"
                className="add-mat-btn"
                onClick={handleIncreaseExisting}
              >
                Increase
              </button>
            </div>
          </div>

          {materialsToUpdate.length > 0 && (
            <>
              <h4 className="section-title">📦 Materials to Update</h4>
              <ul className="selected-materials">
                {materialsToUpdate.map((mat, idx) => (
                  <li key={idx}>
                    {mat.name} – +{mat.quantity}
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
            </>
          )}

          <div className="tt-actions">
            <button type="button" className="tt-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tt-create">
              Confirm Update
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-modal-overlay" onMouseDown={() => setError(null)}>
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

export default UpdateProjectMaterialsModal;
