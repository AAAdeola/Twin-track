import React, { useState } from "react";
import {
  FiTrash2,
  FiSlash,
  FiCheck,
  FiUser,
  FiSearch,
  FiBell,
  FiFilter,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./WorkersList.css";

const WorkersList = () => {
  const [workers, setWorkers] = useState([
    {
      id: 1,
      name: "John Doe",
      projects: [
        {
          id: 101,
          name: "Eco-Park Build",
          tasks: ["UI Design", "API Integration"],
          supervisor: "Sarah Adams",
        },
        {
          id: 102,
          name: "Metro Line Extension",
          tasks: ["Testing", "Deployment"],
          supervisor: "Mark Cole",
        },
      ],
      suspended: false,
    },
    {
      id: 2,
      name: "Jane Smith",
      projects: [
        {
          id: 103,
          name: "Urban Redevelopment",
          tasks: ["Database Setup", "Schema Review"],
          supervisor: "James Roy",
        },
      ],
      suspended: false,
    },
    {
      id: 3,
      name: "Daniel Lee",
      projects: [],
      suspended: true,
    },
  ]);

  const [selectedTasks, setSelectedTasks] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentWorker, setCurrentWorker] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const toggleTaskSelect = (workerId, projectId, task) => {
    setSelectedTasks((prev) => {
      const key = `${workerId}-${projectId}-${task}`;
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      else updated[key] = true;
      return updated;
    });
  };

  const handleRemoveClick = (worker) => {
    const hasSelected = Object.keys(selectedTasks).some((key) =>
      key.startsWith(`${worker.id}-`)
    );
    if (!hasSelected)
      return alert("Select at least one task or project to remove.");
    setCurrentWorker(worker);
    setShowConfirm(true);
  };

  const confirmRemove = () => {
    if (!currentWorker) return;

    const updatedWorkers = workers.map((w) => {
      if (w.id === currentWorker.id) {
        return {
          ...w,
          projects: w.projects
            .map((p) => ({
              ...p,
              tasks: p.tasks.filter(
                (task) => !selectedTasks[`${w.id}-${p.id}-${task}`]
              ),
            }))
            .filter((p) => p.tasks.length > 0),
        };
      }
      return w;
    });

    setWorkers(updatedWorkers);
    setSelectedTasks({});
    setShowConfirm(false);
  };

  const toggleSuspend = (id) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, suspended: !w.suspended } : w
      )
    );
  };

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && !w.suspended) ||
      (filterStatus === "Suspended" && w.suspended);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="workers-page">
      <Sidebar />

      <main className="workers-main">
        <header className="topbar">
          <div className="search-filter-row">
            <div className="search-bar">
              <FiSearch />
              <input
                type="text"
                placeholder="Search workers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-box">
              <FiFilter />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Workers</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="topbar-icons">
            <FiBell />
            <FiUser />
          </div>
        </header>

        <section className="content-area">
          <h2 className="page-title">Workers List</h2>

          <div className="table-container">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Projects & Tasks</th>
                  <th>Supervisor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.length > 0 ? (
                  filteredWorkers.map((worker) => (
                    <tr
                      key={worker.id}
                      className={worker.suspended ? "suspended" : ""}
                    >
                      <td>
                        <div className="worker-info">
                          <FiUser /> {worker.name}
                        </div>
                      </td>

                      <td>
                        {worker.projects.length === 0 ? (
                          <span className="no-projects">No active projects</span>
                        ) : (
                          worker.projects.map((project) => (
                            <div key={project.id} className="project-block">
                              <strong>{project.name}</strong>
                              <ul>
                                {project.tasks.map((task) => {
                                  const key = `${worker.id}-${project.id}-${task}`;
                                  return (
                                    <li key={key}>
                                      <label>
                                        <input
                                          type="checkbox"
                                          checked={!!selectedTasks[key]}
                                          onChange={() =>
                                            toggleTaskSelect(
                                              worker.id,
                                              project.id,
                                              task
                                            )
                                          }
                                        />
                                        {task}
                                      </label>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))
                        )}
                      </td>

                      <td>
                        {worker.projects.map((p) => (
                          <div key={p.id}>{p.supervisor}</div>
                        ))}
                      </td>

                      <td className="actions">
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveClick(worker)}
                        >
                          <FiTrash2 /> Remove
                        </button>

                        <button
                          className={`suspend-btn ${
                            worker.suspended ? "retain" : "suspend"
                          }`}
                          onClick={() => toggleSuspend(worker.id)}
                        >
                          {worker.suspended ? (
                            <>
                              <FiCheck /> Retain
                            </>
                          ) : (
                            <>
                              <FiSlash /> Suspend
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-results">
                      No workers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showConfirm && (
          <div className="confirm-modal">
            <div className="confirm-box">
              <h3>Confirm Removal</h3>
              <p>
                Are you sure you want to remove the selected task(s) for{" "}
                <strong>{currentWorker.name}</strong>?
              </p>
              <div className="confirm-actions">
                <button
                  className="cancel"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button className="confirm" onClick={confirmRemove}>
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkersList;
