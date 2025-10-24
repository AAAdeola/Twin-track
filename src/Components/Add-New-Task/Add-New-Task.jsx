import React, { useState } from "react";
import "./Add-New-Task.css";

const AddNewTask = ({ onClose, onCreate, projectSupervisors = [] }) => {
  const mockWorkers = [
    "John Doe",
    "Mary James",
    "Ali Ibrahim",
    "Grace Obi",
    "Tunde Bako",
  ];

  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    assignedSupervisors: [],
    assignedWorkers: [],
    priority: "Low",
    status: "Not Started",
    dueDate: "",
  });

  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSupervisor = () => {
    if (
      selectedSupervisor &&
      !formData.assignedSupervisors.includes(selectedSupervisor)
    ) {
      setFormData({
        ...formData,
        assignedSupervisors: [
          ...formData.assignedSupervisors,
          selectedSupervisor,
        ],
      });
      setSelectedSupervisor("");
    }
  };

  const handleRemoveSupervisor = (name) => {
    setFormData({
      ...formData,
      assignedSupervisors: formData.assignedSupervisors.filter(
        (s) => s !== name
      ),
    });
  };

  const handleAddWorker = () => {
    if (selectedWorker && !formData.assignedWorkers.includes(selectedWorker)) {
      setFormData({
        ...formData,
        assignedWorkers: [...formData.assignedWorkers, selectedWorker],
      });
      setSelectedWorker("");
    }
  };

  const handleRemoveWorker = (name) => {
    setFormData({
      ...formData,
      assignedWorkers: formData.assignedWorkers.filter((w) => w !== name),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.taskName.trim()) return;

    onCreate?.(formData);
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
          <h3>Create New Task</h3>
          <p className="muted">
            Assign supervisors (from project) and workers (from database)
          </p>
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

          <div className="tt-row">
            <label>Assign Supervisors</label>
            <div className="assign-select">
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
              >
                <option value="">Select Supervisor</option>
                {projectSupervisors.length === 0 ? (
                  <option disabled>No supervisors in project</option>
                ) : (
                  projectSupervisors.map((sup, idx) => (
                    <option key={idx} value={sup}>
                      {sup}
                    </option>
                  ))
                )}
              </select>
              <button type="button" onClick={handleAddSupervisor}>
                Add
              </button>
            </div>
            <ul className="assign-list">
              {formData.assignedSupervisors.map((sup, idx) => (
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

          <div className="tt-row">
            <label>Assign Workers</label>
            <div className="assign-select">
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
              >
                <option value="">Select Worker</option>
                {mockWorkers.map((wrk, idx) => (
                  <option key={idx} value={wrk}>
                    {wrk}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleAddWorker}>
                Add
              </button>
            </div>
            <ul className="assign-list">
              {formData.assignedWorkers.map((wrk, idx) => (
                <li key={idx}>
                  {wrk}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveWorker(wrk)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
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
