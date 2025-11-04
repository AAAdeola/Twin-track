import React, { useEffect, useState } from "react";
import ModalShell from "./ModalShell";

const AssignSupervisorModal = ({
  onClose,
  onAssign,
  supervisors,
  fetchSupervisors,
  projectAssignments, // ✅ contains existing supervisors
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [level, setLevel] = useState(2); // ✅ Default: Standard

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const existing = projectAssignments?.supervisors ?? [];

  const lead = existing.find((s) => s.role === "Lead");
  const assistant = existing.find((s) => s.role === "Assistant");

  const filtered = (supervisors || []).filter((s) =>
    (s.fullName ?? `${s.firstName} ${s.lastName}`)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <ModalShell title="Assign Supervisor" onClose={onClose}>
      <div className="form-row">
        <label>Search Supervisors</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <ul className="pd-list small-scroll">
        {filtered.length === 0 ? (
          <li className="muted">No supervisors found</li>
        ) : (
          filtered.map((s) => {
            const id = s.supervisorId ?? s.id;
            const fullName =
              s.fullName ?? `${s.firstName} ${s.lastName}`.trim();

            const isLead = lead && lead.supervisorId === id;
            const isSelected = selected === id;

            return (
              <li
                key={id}
                onClick={() => !isLead && setSelected(id)}
                className={
                  isLead ? "disabled-row" : isSelected ? "selected" : ""
                }
                style={{
                  cursor: isLead ? "not-allowed" : "pointer",
                  opacity: isLead ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <input
                  type="radio"
                  disabled={isLead}
                  checked={isSelected}
                  onChange={() => setSelected(id)}
                />

                <span>{fullName}</span>

                {isLead && (
                  <span className="badge badge-lead">Lead</span>
                )}
              </li>
            );
          })
        )}
      </ul>

      {/* ✅ Level select */}
      <div className="form-row">
        <label>Supervisor Level</label>
        <select
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          {/* ✅ Assistant disabled if one exists */}
          <option value={1} disabled={!!assistant}>
            Assistant {assistant ? "(Already assigned)" : ""}
          </option>

          <option value={2}>Standard</option>
        </select>
      </div>

      <div className="pd-modal-actions">
        <button
          className="btn"
          disabled={!selected}
          onClick={() => onAssign(selected, level)}
        >
          Assign Supervisor
        </button>

        <button className="btn btn-outline" onClick={onClose}>
          Cancel
        </button>
      </div>
    </ModalShell>
  );
};

export default AssignSupervisorModal;
