import React, { useState } from "react";
import "./Add-New-Task.css";

const AddNewTask = ({ onClose }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    assignedTo1: "",
    assignedTo2: "",
    priority: "Low",
    status: "Not Started",
    dueDate: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app you would submit to API/store
    console.log("New Task created:", formData);
    onClose();
  };

  return (
    <div className="tt-modal-overlay" onMouseDown={onClose}>
      <div
        className="tt-modal-card"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <button className="tt-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="tt-modal-head">
          <h3>Project Tasks</h3>
          <p className="muted">Add a new task and assign team members</p>
        </div>

        <form className="tt-form" onSubmit={handleSubmit}>
          <div className="tt-row">
            <label>Task Name</label>
            <input
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              placeholder="Enter task name"
              required
            />
          </div>

          <div className="tt-row">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description"
              rows="3"
            />
          </div>

          <div className="tt-grid">
            <div className="tt-row">
              <label>Assigned To</label>
              <input
                name="assignedTo1"
                value={formData.assignedTo1}
                onChange={handleChange}
                placeholder="John D."
              />
            </div>
            <div className="tt-row">
              <label>Assigned To</label>
              <input
                name="assignedTo2"
                value={formData.assignedTo2}
                onChange={handleChange}
                placeholder="Sarah K."
              />
            </div>
          </div>

          <div className="tt-grid">
            <div className="tt-row">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="tt-row">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <div className="tt-row">
            <label>Due Date</label>
            <input
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="tt-actions">
            <button type="button" className="tt-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tt-create">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewTask;
