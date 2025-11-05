import React, { useEffect, useState } from "react";
import { FiTrash2, FiSlash, FiCheck, FiUser, FiSearch, FiBell } from "react-icons/fi";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./SupervisorsList.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SupervisorsList = () => {
  const token = localStorage.getItem("authToken");

  const [supervisors, setSupervisors] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentSupervisor, setCurrentSupervisor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // Fetch supervisors assigned to current user
  const fetchSupervisors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/supervisors/assigned`, {
        headers: authHeaders(),
      });

      const payload = await res.json();
      console.log("✅ Supervisors fetched from backend:", payload.data);

      if (!res.ok || !payload.isSuccess) {
        toast.error(payload.message || "Failed to load supervisors.");
        return;
      }

      setSupervisors(payload.data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading supervisors.");
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  // Toggle selection for project/task checkboxes
  const toggleItemSelect = (supervisorId, projectId, taskId = null) => {
    const key = taskId ? `${supervisorId}-${projectId}-${taskId}` : `${supervisorId}-${projectId}`;
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      else updated[key] = true;
      return updated;
    });
  };

  // Open confirmation dialog for removal
  const handleRemoveClick = (supervisor) => {
    const hasAny = Object.keys(selectedItems).some((k) => k.startsWith(supervisor.supervisorId));
    if (!hasAny) {
      toast.warn("Select a project or task to remove.");
      return;
    }
    setCurrentSupervisor(supervisor);
    setShowConfirm(true);
  };

  // Confirm removal → call backend
  const confirmRemove = async () => {
    if (!currentSupervisor) return;

    const removalPayload = {
      removeProjects: [],
      removeTasks: [],
    };

    for (const key of Object.keys(selectedItems)) {
      const [supId, projectId, taskId] = key.split("-");
      if (taskId) {
        removalPayload.removeTasks.push({ SupervisorId: supId, TaskId: taskId });
      } else {
        removalPayload.removeProjects.push({ SupervisorId: supId, ProjectId: projectId });
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/supervisors/remove-assignments`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify(removalPayload),
      });

      const payload = await res.json();

      if (!res.ok || !payload.isSuccess) {
        toast.error(payload.message || "Failed to remove assignments.");
        return;
      }

      toast.success("Supervisor assignments updated.");
      setSelectedItems({});
      setShowConfirm(false);
      fetchSupervisors();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  // Suspend / Retain supervisor
  const toggleSuspend = async (supervisor) => {
    try {
      const endpoint = supervisor.suspended ? "retain" : "suspend";

      const res = await fetch(`${API_BASE_URL}/api/v1/supervisors/${supervisor.supervisorId}/${endpoint}`, {
        method: "PUT",
        headers: authHeaders(),
      });

      const payload = await res.json();
      if (!res.ok || !payload.isSuccess) {
        toast.error(payload.message || "Action failed.");
        return;
      }

      toast.success(payload.message);
      fetchSupervisors();
    } catch (err) {
      console.error(err);
      toast.error("Error updating supervisor status.");
    }
  };

  // Filter supervisors by search and status
  const filteredSupervisors = supervisors.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && !s.suspended) ||
      (filterStatus === "Suspended" && s.suspended);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="supervisors-page">
      <Sidebar />

      <main className="supervisors-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search supervisors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="topbar-icons">
            <FiBell />
            <FiUser />
          </div>
        </header>

        <section className="content-area">
          <h2 className="page-title">Supervisors List</h2>

          <table className="supervisors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Projects & Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSupervisors.length > 0 ? (
                filteredSupervisors.map((sup) => (
                  <tr key={sup.supervisorId}>
                    <td className={sup.suspended ? "suspended" : ""}>
                      <FiUser /> {sup.fullName}
                    </td>

                    <td>
                      {(sup.projects || []).map((project) => (
                        <div key={project.projectId} className="project-block">
                          <strong>
                            <input
                              type="checkbox"
                              checked={!!selectedItems[`${sup.supervisorId}-${project.projectId}`]}
                              onChange={() => toggleItemSelect(sup.supervisorId, project.projectId)}
                              disabled={project.isLead} // disable checkbox if lead
                            />{" "}
                            {project.projectName} {project.isLead && "(Lead)"}
                          </strong>

                          <ul>
                            {(project.tasks || []).map((task) => {
                              const key = `${sup.supervisorId}-${project.projectId}-${task.id}`;
                              return (
                                <li key={task.id}>
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={!!selectedItems[key]}
                                      onChange={() =>
                                        toggleItemSelect(sup.supervisorId, project.projectId, task.id)
                                      }
                                      disabled={project.isLead} // optionally prevent removing tasks for lead
                                    />
                                    {task.name}
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </td>

                    <td className="actions">
  <button
    className="remove-btn"
    onClick={() => handleRemoveClick(sup)}
    disabled={sup.projects.some(p => p.isLead)} // disable if supervisor is a lead in any project
    title={sup.projects.some(p => p.isLead) ? "Cannot remove a project lead" : ""}
  >
    <FiTrash2 /> Remove
  </button>

  <button
    className={`suspend-btn ${sup.suspended ? "retain" : "suspend"}`}
    onClick={() => toggleSuspend(sup)}
    disabled={sup.projects.some(p => p.isLead)} // disable suspend if supervisor is a lead
    title={sup.projects.some(p => p.isLead) ? "Cannot suspend a project lead" : ""}
  >
    {sup.suspended ? (
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
                  <td colSpan="3" className="no-results">
                    No supervisors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {showConfirm && (
          <ConfirmDialog
            title="Confirm Removal"
            message={`Are you sure you want to remove the selected assignments for ${currentSupervisor.fullName}?`}
            onConfirm={confirmRemove}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </main>
    </div>
  );
};

export default SupervisorsList;
