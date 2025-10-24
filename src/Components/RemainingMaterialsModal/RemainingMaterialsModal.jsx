import React, { useState } from "react";
import "./RemainingMaterialsModal.css";

const RemainingMaterialsModal = ({ task, project, onUpdate, onClose }) => {
  const [selected, setSelected] = useState("");
  const [qtyUsed, setQtyUsed] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const mat = task.materials.find((m) => m.name === selected);
    if (!mat) return;

    const usedQty = parseInt(qtyUsed);
    if (usedQty <= 0 || usedQty > mat.quantity) return;

    const updated = {
      name: mat.name,
      quantityUsed: usedQty,
      remaining: mat.quantity - usedQty,
    };

    onUpdate(updated);
    onClose();
  };

  return (
    <div className="tt-modal-overlay" onMouseDown={onClose}>
      <div className="tt-modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <button className="tt-close" onClick={onClose}>×</button>
        <h3>Record Remaining Materials</h3>
        <p className="muted">Enter how much material was used.</p>

        <form onSubmit={handleSubmit}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select material</option>
            {task.materials.map((m, i) => (
              <option key={i} value={m.name}>
                {m.name} (Available: {m.quantity})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Quantity used"
            value={qtyUsed}
            onChange={(e) => setQtyUsed(e.target.value)}
          />

          <div className="tt-actions">
            <button type="button" className="tt-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tt-create">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemainingMaterialsModal;
