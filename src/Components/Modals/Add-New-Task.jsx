import React, { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { toast } from "react-toastify";

const AddTaskModal = ({ projectId, onClose, onCreate, fetchProjectWorkers, projectWorkers }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!projectWorkers || projectWorkers.length === 0) fetchProjectWorkers();
  }, []);

  const handleCreate = () => {
    if (!name || !deadline) {
      toast.error("Task name and deadline are required.");
      return;
    }

    const payload = {
      name,
      description: desc,
      deadLine: deadline,
      workerId: selectedWorker ?? null,
      projectId,
    };

    onCreate(payload);
  };

  const filtered = (projectWorkers || []).filter((w) =>
    `${w.firstName ?? w.name ?? ""} ${w.lastName ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <ModalShell title="Add New Task" onClose={onClose}>
      <div className="form-row">
        <label>Task Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Deadline</label>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Assign Worker (optional)</label>
        <input placeholder="Search workers..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <ul className="pd-list small-scroll">
        {filtered.length === 0 ? (
          <li className="muted">No workers found</li>
        ) : (
          filtered.map((w) => (
            <li
              key={w.id}
              onClick={() => setSelectedWorker(w.id)}
              className={selectedWorker === w.id ? "selected" : ""}
            >
              {(w.firstName ?? w.name ?? "") + " " + (w.lastName ?? "")}
            </li>
          ))
        )}
      </ul>

      <div className="pd-modal-actions">
        <button className="btn" onClick={handleCreate}>Create</button>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
      </div>
    </ModalShell>
  );
};

export default AddTaskModal;
