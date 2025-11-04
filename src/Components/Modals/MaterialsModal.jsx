import React, { useState } from "react";
import ModalShell from "./ModalShell";
import { toast } from "react-toastify";

const MaterialsModal = ({ onClose, materials = [], onAssign, task }) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [assignQuantity, setAssignQuantity] = useState(0);

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const maxQuantity = selectedMaterial
    ? selectedMaterial.quantity ?? selectedMaterial.available ?? 0
    : 0;

  const handleAssign = () => {
    if (!selectedMaterialId) {
      toast.error("Select a material first.");
      return;
    }
    if (assignQuantity <= 0 || assignQuantity > maxQuantity) {
      toast.error(`Enter a valid quantity (1-${maxQuantity}).`);
      return;
    }

    const payload = [
      {
        id: selectedMaterial.id,
        name: selectedMaterial.name ?? selectedMaterial.materialName,
        quantity: assignQuantity,
      },
    ];

    if (onAssign) onAssign(task.id, payload);
    onClose();
  };

  return (
    <ModalShell title={`Assign Materials — ${task.name}`} onClose={onClose}>
      <div className="pd-material-select">
        <label>
          Material:
          <select
            value={selectedMaterialId}
            onChange={(e) => {
              setSelectedMaterialId(e.target.value);
              setAssignQuantity(0); // reset quantity when material changes
            }}
          >
            <option value="">-- Select Material --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name ?? m.materialName} — Available: {m.quantity ?? m.available ?? 0}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="pd-material-quantity" style={{ marginTop: "1rem" }}>
        <label>
          Quantity:
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={assignQuantity}
            onChange={(e) =>
              setAssignQuantity(
                Math.min(Math.max(0, Number(e.target.value)), maxQuantity)
              )
            }
            disabled={!selectedMaterialId} // disable until material is selected
            placeholder={selectedMaterialId ? `1-${maxQuantity}` : "Select material first"}
          />
        </label>
      </div>

      <div className="pd-modal-actions" style={{ marginTop: "1rem" }}>
        <button className="btn" onClick={handleAssign}>
          Assign to Task
        </button>
        <button className="btn btn-outline" onClick={onClose}>
          Cancel
        </button>
      </div>
    </ModalShell>
  );
};

export default MaterialsModal;
