import React, { useEffect, useState } from "react";
import ModalShell from "./ModalShell";

const AssignWorkerToTaskModal = ({
  onClose,
  onAssign,
  task,
  projectWorkers,
  fetchProjectWorkers,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    console.log("🔵 AssignWorkerToTaskModal mounted");
    fetchProjectWorkers();
  }, []);

  console.log("✅ projectWorkers in modal:", projectWorkers);

  const filtered = (projectWorkers || []).filter((w) =>
    (w.fullName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ModalShell title={`Assign Worker — ${task?.name}`} onClose={onClose}>
      <div className="form-row">
        <label>Search Workers</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <ul className="pd-list small-scroll">
        {filtered.length === 0 ? (
          <li className="muted">No workers found</li>
        ) : (
          filtered.map((w) => {
            const isSelected = selected === w.workerId;
            return (
              <li
                key={w.workerId}
                className={isSelected ? "selected" : ""}
                onClick={() => setSelected(w.workerId)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                }}
              >
                {/* ✅ Checkbox styled as radio */}
                <input
                  type="radio"
                  name="workerSelect"
                  checked={isSelected}
                  onChange={() => setSelected(w.workerId)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />

                <span>{w.fullName}</span>
              </li>
            );
          })
        )}
      </ul>

      <div className="pd-modal-actions">
        <button
          className="btn"
          disabled={!selected}
          onClick={() => onAssign(selected)}
        >
          Assign Worker
        </button>

        <button className="btn btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  );
};

export default AssignWorkerToTaskModal;
