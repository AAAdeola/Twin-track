import React, { useState } from "react";
import "./TaskMaterialsModal.css";

const TaskMaterialsModal = ({ task, project, onClose, onAddMaterial }) => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [addQty, setAddQty] = useState("");

  const handleAddConfirm = () => {
    if (!selectedMaterial) return;

    const projectMat = project.materials.find(
      (m) => m.name === selectedMaterial.name
    );
    const availableQty = projectMat ? projectMat.quantity : 0;

    const addAmount = parseFloat(addQty);

    if (isNaN(addAmount) || addAmount <= 0) {
      alert("Please enter a valid quantity greater than 0.");
      return;
    }

    if (addAmount > availableQty) {
      alert(
        `Cannot add more than available (${availableQty} remaining in project).`
      );
      return;
    }

    // ✅ Update the material in the task
    onAddMaterial({
      name: selectedMaterial.name,
      quantity: selectedMaterial.quantity + addAmount,
    });

    // ✅ Deduct from project materials
    projectMat.quantity -= addAmount;

    // Reset modal state
    setSelectedMaterial(null);
    setAddQty("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Materials for {task.name}</h2>

        <table className="modal-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Quantity Used</th>
              <th>Add More</th>
            </tr>
          </thead>
          <tbody>
            {task.materials && task.materials.length > 0 ? (
              task.materials.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.quantity}</td>
                  <td>
                    <button
                      className="tt-small-btn add"
                      onClick={() => setSelectedMaterial(m)}
                    >
                      ➕
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="muted">
                  No materials added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="modal-actions">
          <button className="tt-small-btn close" onClick={onClose}>
            Close
          </button>
        </div>

        {/* ✅ Nested Modal for Adding Quantity */}
        {selectedMaterial && (
          <div className="nested-overlay">
            <div className="nested-modal">
              <h3>Add to {selectedMaterial.name}</h3>
              <p className="muted">
                Available in project:{" "}
                {
                  project.materials.find(
                    (m) => m.name === selectedMaterial.name
                  )?.quantity ?? 0
                }
              </p>

              <input
                type="number"
                placeholder="Enter quantity to add"
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
              />

              <div className="nested-actions">
                <button className="tt-small-btn add" onClick={handleAddConfirm}>
                  Confirm
                </button>
                <button
                  className="tt-small-btn close"
                  onClick={() => setSelectedMaterial(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskMaterialsModal;
