import React, { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import ModalShell from "./ModalShell";
import { toast } from "react-toastify";

const ProjectMaterialsModal = ({ onClose, projectId, materials, onAddMaterial, onIncrease }) => {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(0);

  const handleAdd = () => {
    if (!name || qty <= 0) {
      toast.error("Provide material name and valid quantity.");
      return;
    }
onAddMaterial({ name, TotalQuantity: qty, projectId });
    setName("");
    setQty(0);
  };

  return (
    <ModalShell title="Project Materials" onClose={onClose}>
      <ul className="pd-material-list">
        {materials?.length > 0 ? (
          materials.map((m, i) => (
            <li key={i}>
              <strong>{m.name}</strong> — {m.quantity ?? m.available ?? "-"}
              <button className="small" onClick={() => onIncrease(m)}>
                + increase
              </button>
            </li>
          ))
        ) : (
          <li className="muted">No materials yet</li>
        )}
      </ul>

      <div className="form-row">
        <label>Add Material</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cement" />
      </div>

      <div className="form-row">
        <label>Quantity</label>
        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
      </div>

      <div className="pd-modal-actions">
        <button className="btn" onClick={handleAdd}>
          <FiPlusCircle /> Add
        </button>
        <button className="btn btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  );
};

export default ProjectMaterialsModal;
