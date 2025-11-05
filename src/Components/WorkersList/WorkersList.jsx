import React, { useEffect, useState } from "react";
import {
  FiTrash2,
  FiSlash,
  FiCheck,
  FiUser,
  FiSearch,
  FiBell,
  FiFilter,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import "./WorkersList.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const WorkersList = () => {
  const token = localStorage.getItem("authToken");

  const [workers, setWorkers] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentWorker, setCurrentWorker] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // Load workers with assignments
  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/worker/assigned`, {
        headers: authHeaders(),
      });

      console.log("Raw response status:", res.status);

      const payload = await res.json().catch((err) => {
        console.error("Error parsing JSON:", err);
        return null;
      });

      console.log("Payload from backend (full):", payload);

      if (!payload) {
        toast.error("Backend did not return valid JSON.");
        return;
      }

      // ✅ Use isSuccess (backend returns isSuccess)
      if (!res.ok || !payload.isSuccess) {
        toast.error(payload.message ?? "Failed to load workers.");
        return;
      }

      console.log("Workers data received:", payload.data);
      setWorkers(payload.data || []);
    } catch (err) {
      toast.error("Error fetching workers.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Select / deselect task
  const toggleTaskSelect = (workerId, projectId, taskId) => {
    setSelectedTasks((prev) => {
      const key = `${workerId}-${projectId}-${taskId}`;
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      else updated[key] = true;
      return updated;
    });
  };

  // Open confirmation for removing tasks
  const handleRemoveClick = (worker) => {
    const hasSelected = Object.keys(selectedTasks).some((key) =>
      key.startsWith(`${worker.workerId}-`)
    );

    if (!hasSelected) {
      toast.warn("Select at least one task to remove.");
      return;
    }

    setCurrentWorker(worker);
    setShowConfirm(true);
  };

  // Remove worker from selected tasks
  const confirmRemove = async () => {
    if (!currentWorker) return;

    try {
      const tasksToRemove = Object.keys(selectedTasks)
        .filter((key) => key.startsWith(`${currentWorker.workerId}-`))
        .map((key) => {
          const [workerId, projectId, taskId] = key.split("-");
          return { WorkerId: workerId, TaskId: taskId };
        });

      if (tasksToRemove.length === 0) {
        toast.warn("No tasks selected.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/worker/tasks/remove`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ Assignments: tasksToRemove }),
      });

      const payload = await res.json();

      if (!res.ok) {
        toast.error(payload.message ?? "Failed to remove worker from tasks.");
        return;
      }

      toast.success("Worker removed from selected tasks.");
      setSelectedTasks({});
      setShowConfirm(false);
      setCurrentWorker(null);
      fetchWorkers();
    } catch (err) {
      console.error(err);
      toast.error("Error while removing worker.");
    }
  };

  // Suspend or retain worker
  const toggleSuspend = async (worker) => {
    try {
      const endpoint = worker.suspended ? "retain" : "suspend";

      const res = await fetch(
        `${API_BASE_URL}/api/v1/worker/${worker.workerId}/${endpoint}`,
        { method: "PUT", headers: authHeaders() }
      );

      const payload = await res.json();

      if (!res.ok) {
        toast.error(payload.message ?? "Action failed.");
        return;
      }

      toast.success(payload.message);
      fetchWorkers();
    } catch {
      toast.error("Error updating worker status.");
    }
  };

  // Search + filter workers
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch = (w.fullName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
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
                      key={worker.workerId}
                      className={worker.suspended ? "suspended" : ""}
                    >
                      <td>
                        <div className="worker-info">
                          <FiUser /> {worker.fullName || "No Name"}
                        </div>
                      </td>

                      <td>
                        {worker.projects?.length === 0 ? (
                          <span className="no-projects">No active projects</span>
                        ) : (
                          worker.projects.map((project) => (
                            <div key={project.projectId} className="project-block">
                              <strong>{project.projectName || "No Project Name"}</strong>
                              <ul>
                                {project.tasks?.map((task) => {
                                  const key = `${worker.workerId}-${project.projectId}-${task.taskId}`;
                                  return (
                                    <li key={key}>
                                      <label>
                                        <input
                                          type="checkbox"
                                          checked={!!selectedTasks[key]}
                                          onChange={() =>
                                            toggleTaskSelect(
                                              worker.workerId,
                                              project.projectId,
                                              task.taskId
                                            )
                                          }
                                        />
                                        {task.taskName || "Unnamed Task"}
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
                        {worker.projects?.map((p) => (
                          <div key={p.projectId}>{p.supervisorName || "No Supervisor"}</div>
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
                          className={`suspend-btn ${worker.suspended ? "retain" : "suspend"}`}
                          onClick={() => toggleSuspend(worker)}
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

        {showConfirm && currentWorker && (
          <div className="confirm-modal">
            <div className="confirm-box">
              <h3>Confirm Removal</h3>
              <p>
                Are you sure you want to remove the selected task(s) for{" "}
                <strong>{currentWorker.fullName || "this worker"}</strong>?
              </p>
              <div className="confirm-actions">
                <button className="cancel" onClick={() => setShowConfirm(false)}>
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
