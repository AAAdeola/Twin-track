import React from "react";
import "./TaskMaterialsModal.css";

const TaskMaterialsModal = ({ task, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Materials used for {task.name}</h2>

        <table className="modal-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Quantity Used</th>
            </tr>
          </thead>

          <tbody>
            {task.materials && task.materials.length > 0 ? (
              task.materials.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="muted">
                  No materials assigned to this task yet.
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
      </div>
    </div>
  );
};

export default TaskMaterialsModal;
