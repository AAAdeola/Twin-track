import React, { useState } from "react";
import { FiTrash2, FiUser } from "react-icons/fi";
import Sidebar from "../Sidebar/Sidebar";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./SupervisorsList.css";

const SupervisorsList = () => {
  const [supervisors, setSupervisors] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      projects: ["Bridge Renovation", "Mall Construction"],
      tasks: ["Site Inspection", "Safety Audit"],
    },
    {
      id: 2,
      name: "Michael Chen",
      projects: ["Office Complex"],
      tasks: ["Team Coordination", "Budget Review"],
    },
  ]);

  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openModal = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setSelectedItems([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSupervisor(null);
  };

  const toggleItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleRemove = () => {
    if (!selectedSupervisor) return;

    const updated = supervisors.map((sup) => {
      if (sup.id === selectedSupervisor.id) {
        return {
          ...sup,
          projects: sup.projects.filter((p) => !selectedItems.includes(p)),
          tasks: sup.tasks.filter((t) => !selectedItems.includes(t)),
        };
      }
      return sup;
    });

    setSupervisors(updated);
    setShowConfirm(false);
    closeModal();
  };

  return (
    <div className="supervisors-page">
      <Sidebar />

      <main className="supervisors-main">
        <header className="supervisors-header">
          <h2>Supervisors</h2>
        </header>

        <section className="supervisors-content">
          <table className="supervisors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Projects</th>
                <th>Tasks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map((supervisor) => (
                <tr key={supervisor.id}>
                  <td className="name-cell">
                    <FiUser /> {supervisor.name}
                  </td>
                  <td>
                    {supervisor.projects.length > 0
                      ? supervisor.projects.join(", ")
                      : "—"}
                  </td>
                  <td>
                    {supervisor.tasks.length > 0
                      ? supervisor.tasks.join(", ")
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => openModal(supervisor)}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Remove Modal */}
        {showModal && selectedSupervisor && (
          <div className="tt-modal-overlay">
            <div className="tt-modal-card">
              <h2>Remove from Project/Task</h2>
              <p>
                Select the project(s) or task(s) to remove{" "}
                <strong>{selectedSupervisor.name}</strong> from:
              </p>

              <div className="checkbox-group">
                <h4>Projects</h4>
                {selectedSupervisor.projects.map((p, i) => (
                  <label key={i} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(p)}
                      onChange={() => toggleItem(p)}
                    />
                    {p}
                  </label>
                ))}

                <h4>Tasks</h4>
                {selectedSupervisor.tasks.map((t, i) => (
                  <label key={i} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(t)}
                      onChange={() => toggleItem(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  disabled={selectedItems.length === 0}
                  onClick={() => setShowConfirm(true)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {showConfirm && selectedSupervisor && (
          <ConfirmDialog
            title="Confirm Removal"
            message={`Are you sure you want to remove ${selectedSupervisor.name} from the selected projects/tasks?`}
            onConfirm={handleRemove}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </main>
    </div>
  );
};

export default SupervisorsList;
