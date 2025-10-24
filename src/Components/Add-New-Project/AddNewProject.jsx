import React, { useState } from "react";
import "./AddNewProject.css";

const AddNewProject = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    projectName: "",
    projectCode: "",
    description: "",
    status: "Active",
    supervisors: [],
  });

  const [newSupervisor, setNewSupervisor] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSupervisor = () => {
    if (newSupervisor.trim() !== "") {
      setFormData({
        ...formData,
        supervisors: [...formData.supervisors, newSupervisor.trim()],
      });
      setNewSupervisor("");
    }
  };

  const handleRemoveSupervisor = (name) => {
    setFormData({
      ...formData,
      supervisors: formData.supervisors.filter((sup) => sup !== name),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.projectName.trim() === "") return;

    onCreate(formData);
    onClose();
  };

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
          <h3>Create New Project</h3>
          <p className="muted">Add project details and assign supervisors</p>
        </div>

        <form className="tt-form" onSubmit={handleSubmit}>
          <div className="tt-row">
            <label>Project Name</label>
            <input
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="tt-row">
            <label>Project Code</label>
            <input
              name="projectCode"
              value={formData.projectCode}
              onChange={handleChange}
              placeholder="e.g. PRJ-001"
              required
            />
          </div>

          <div className="tt-row">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short project overview"
              rows="3"
            />
          </div>

          <div className="tt-row">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="tt-row">
            <label>Supervisors</label>
            <div className="supervisor-input">
              <input
                value={newSupervisor}
                onChange={(e) => setNewSupervisor(e.target.value)}
                placeholder="Enter supervisor name"
              />
              <button type="button" onClick={handleAddSupervisor}>
                Add
              </button>
            </div>
            <ul className="supervisor-list">
              {formData.supervisors.map((sup, idx) => (
                <li key={idx}>
                  {sup}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveSupervisor(sup)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="tt-actions">
            <button type="button" className="tt-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tt-create">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProject;
