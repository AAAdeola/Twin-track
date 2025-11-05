import React, { useState, useEffect } from "react";
import ModalShell from "./ModalShell";
import { toast } from "react-toastify";

const MaterialsModal = ({ onClose, materials = [], onAssign, task }) => {
  const [normalizedMaterials, setNormalizedMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  // Normalize materials on mount or when materials prop changes
  useEffect(() => {
    const normalized = materials.map((m) => ({
      id: m.id ?? m.materialId,
      name: m.name ?? m.materialName ?? "Unnamed Material",
      availableQuantity: m.availableQuantity ?? m.quantity ?? m.TotalQuantity ?? 0,
      assignQuantity: 1, // default assign quantity
    }));
    setNormalizedMaterials(normalized);
    setSelectedMaterials([]); // reset selection on materials change
  }, [materials]);

  // Toggle material selection
  const toggleMaterialSelection = (materialId) => {
    setSelectedMaterials((prev) => {
      const exists = prev.find((m) => m.id === materialId);
      if (exists) {
        return prev.filter((m) => m.id !== materialId);
      }
      const material = normalizedMaterials.find((m) => m.id === materialId);
      return [...prev, { ...material, quantity: 1 }];
    });
  };

  // Update quantity for a selected material
  const updateQuantity = (materialId, quantity) => {
    setSelectedMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? { ...m, quantity: Math.min(Math.max(quantity, 1), m.availableQuantity) }
          : m
      )
    );
  };

  // const handleAssign = () => {
  //   if (selectedMaterials.length === 0) {
  //     toast.error("Select at least one material.");
  //     return;
  //   }

  //   const invalidQty = selectedMaterials.some(
  //     (m) => m.quantity < 1 || m.quantity > m.availableQuantity
  //   );
  //   if (invalidQty) {
  //     toast.error("Enter valid quantities for all selected materials.");
  //     return;
  //   }

  //   const payload = selectedMaterials.map((m) => ({
  //     id: m.id,
  //     name: m.name,
  //     quantity: m.quantity,
  //   }));

  //   onAssign(task.id, payload);
  //   onClose();
  // };

  const handleAssign = () => {
  if (selectedMaterials.length === 0) {
    toast.error("Select at least one material.");
    return;
  }

  const invalidQty = selectedMaterials.some(
    (m) => m.quantity < 1 || m.quantity > m.availableQuantity
  );
  if (invalidQty) {
    toast.error("Enter valid quantities for all selected materials.");
    return;
  }

  // Pass only { materialId, quantity }
  const payload = selectedMaterials.map((m) => ({
    materialId: m.id,  // make sure this matches backend GUID
    quantity: m.quantity
  }));

  onAssign(task.id, payload);
  onClose();
};

  return (
    <ModalShell title={`Assign Materials — ${task.name}`} onClose={onClose}>
      <div className="pd-material-list">
        {normalizedMaterials.length === 0 ? (
          <div className="muted">No materials available for this project.</div>
        ) : (
          <ul>
            {normalizedMaterials.map((m) => {
              const isSelected = selectedMaterials.some((sm) => sm.id === m.id);
              const selectedMaterial = selectedMaterials.find((sm) => sm.id === m.id);
              return (
                <li key={m.id} className="pd-material-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMaterialSelection(m.id)}
                    />
                    {m.name} — Available: {m.availableQuantity}
                  </label>

                  {isSelected && (
                    <input
                      type="number"
                      min={1}
                      max={m.availableQuantity}
                      value={selectedMaterial.quantity}
                      onChange={(e) =>
                        updateQuantity(m.id, Number(e.target.value))
                      }
                      className="pd-material-quantity-input"
                      style={{ marginLeft: "1rem", width: "60px" }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="pd-modal-actions" style={{ marginTop: "1rem" }}>
        <button className="btn" onClick={handleAssign} disabled={selectedMaterials.length === 0}>
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
