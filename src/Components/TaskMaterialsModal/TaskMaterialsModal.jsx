import React from "react";
import "./TaskMaterialsModal.css";

const TaskMaterialsModal = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="tt-modal-overlay" onMouseDown={onClose}>
      <div
        className="tt-modal-card"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="tt-close" onClick={onClose}>
          ×
        </button>

        <div className="tt-modal-head">
          <h3>Materials for "{task.name}"</h3>
          <p className="muted">
            View all materials assigned to this task
          </p>
        </div>

        {task.materials && task.materials.length > 0 ? (
          <table className="tt-materials-table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {task.materials.map((mat, idx) => (
                <tr key={idx}>
                  <td>{mat.name}</td>
                  <td>{mat.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted" style={{ textAlign: "center", marginTop: 20 }}>
            No materials assigned to this task.
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskMaterialsModal;
