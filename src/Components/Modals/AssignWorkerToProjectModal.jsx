import React, { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { toast } from "react-toastify";

const AssignWorkerToProjectModal = ({
  onClose,
  onAssign,
  fetchAllWorkers,
  allWorkers,
}) => {
  const [search, setSearch] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState([]); // ✅ MULTI SELECT

  useEffect(() => {
    if (!allWorkers || allWorkers.length === 0) fetchAllWorkers();
  }, []);

  /* ✅ Filter workers by search */
  const filtered =
    Array.isArray(allWorkers) 
      ? allWorkers.filter((w) =>
          `${w.firstName ?? w.name ?? ""} ${w.lastName ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : [];

  /* ✅ Toggle worker selection */
  const toggleWorker = (workerId) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  /* ✅ Select All */
  const selectAll = () => {
    const allIds = filtered.map((w) => w.id);
    setSelectedWorkers(allIds);
  };

  /* ✅ Clear selection */
  const clearAll = () => {
    setSelectedWorkers([]);
  };

  /* ✅ Assign selected workers */
  const submit = () => {
    if (selectedWorkers.length === 0) {
      toast.warn("Please select at least one worker");
      return;
    }
    onAssign(selectedWorkers); // ✅ send multiple
  };

  return (
    <ModalShell title="Assign Worker(s) to Project" onClose={onClose}>
      <div className="form-row">
        <label>Search Workers</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>

      {/* ✅ Select All / Clear All buttons */}
      <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
        <button className="btn small" onClick={selectAll}>
          Select All
        </button>
        <button className="btn small btn-outline" onClick={clearAll}>
          Clear
        </button>
      </div>

      {/* ✅ Worker list with checkboxes */}
      <ul className="pd-list small-scroll">
        {filtered.length === 0 ? (
          <li className="muted">No workers found</li>
        ) : (
          filtered.map((w) => {
            const isSelected = selectedWorkers.includes(w.id);
            const fullName = `${w.firstName ?? w.name ?? ""} ${
              w.lastName ?? ""
            }`.trim();

            return (
              <li
  key={w.id}
  className={isSelected ? "selected" : ""}
  style={{
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  }}
  onClick={() => toggleWorker(w.id)} // ✅ keep this
>
  <input
    type="checkbox"
    checked={isSelected}
    onChange={(e) => {
      e.stopPropagation();  // ✅ PREVENT DOUBLE TRIGGER
      toggleWorker(w.id);
    }}
  />
  {fullName}
</li>
            );
          })
        )}
      </ul>

      {/* ✅ Footer Buttons */}
      <div className="pd-modal-actions">
        <button
          className="btn"
          disabled={selectedWorkers.length === 0}
          onClick={submit}
        >
          Assign {selectedWorkers.length} Worker(s)
        </button>

        <button className="btn btn-outline" onClick={onClose}>
          Cancel
        </button>
      </div>
    </ModalShell>
  );
};

export default AssignWorkerToProjectModal;
