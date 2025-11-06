// ✅ FULL UPDATED FILE WITH FIXED GUID SPLITTING AND REMOVAL LOGIC

import React, { useEffect, useState } from "react";
import {
  FiTrash2,
  FiSlash,
  FiCheck,
  FiUser,
  FiSearch,
  FiBell,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar/Sidebar";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./SupervisorsList.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SupervisorsList = () => {
  const token = localStorage.getItem("authToken");

  const [supervisors, setSupervisors] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentSupervisor, setCurrentSupervisor] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // ✅ Fetch supervisors
  const fetchSupervisors = async () => {
    setLoading(true);
    setFetchError(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/supervisors/assigned`, {
        headers: authHeaders(),
      });

      const payload = await res.json();

      if (!res.ok || !payload.isSuccess) {
        toast.error(payload.message || "Failed to load supervisors.");
        setFetchError(true);
        return;
      }

      setSupervisors(payload.data || []);
    } catch (err) {
      toast.error("Error loading supervisors.");
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  // ✅ Only project selection
  const toggleProjectSelect = (supervisorId, projectId) => {
    const key = `${supervisorId}::${projectId}`;  // ✅ SAFE KEY

    setSelectedProjects((prev) => {
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      else updated[key] = true;
      return updated;
    });
  };

  // ✅ Remove button clicked
  const handleRemoveClick = (supervisor) => {
    const hasAny = Object.keys(selectedProjects).some((k) =>
      k.startsWith(supervisor.supervisorId)
    );

    if (!hasAny) {
      toast.warn("Select a project to remove.");
      return;
    }

    setCurrentSupervisor(supervisor);
    setShowConfirm(true);
  };

  // ✅ Confirm removal
  const confirmRemove = async () => {
    if (!currentSupervisor) return;

    const payload = { Assignments: [] };

    for (const key of Object.keys(selectedProjects)) {
      const [supId, projectId] = key.split("::");  // ✅ SAFE SPLIT

      payload.Assignments.push({
        SupervisorId: supId,
        ProjectId: projectId,
      });
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/supervisors/projects/remove`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.isSuccess) {
        toast.error(json.message || "Failed to remove supervisor.");
        return;
      }

      toast.success("Supervisor removed from project.");

      setSelectedProjects({});
      setShowConfirm(false);
      fetchSupervisors();
    } catch (err) {
      toast.error("Error removing supervisor.");
    }
  };

  // ✅ Suspend / retain
  const toggleSuspend = async (supervisor) => {
    try {
      const endpoint = supervisor.suspended ? "retain" : "suspend";

      const res = await fetch(
        `${API_BASE_URL}/api/v1/supervisors/${supervisor.supervisorId}/${endpoint}`,
        { method: "PUT", headers: authHeaders() }
      );

      const payload = await res.json();

      if (!res.ok || !payload.isSuccess) {
        toast.error(payload.message || "Action failed.");
        return;
      }

      toast.success(payload.message);
      fetchSupervisors();
    } catch {
      toast.error("Error updating status.");
    }
  };

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
        <header className="topbar">
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search supervisors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="topbar-icons">
            <FiBell />
            <FiUser />
          </div>
        </header>

        <section className="content-area">
          <h2 className="page-title">Supervisors List</h2>

          {loading && <p className="muted">Loading supervisors…</p>}
          {fetchError && <p className="error-text">Failed to load supervisors.</p>}

          {!loading && !fetchError && (
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
                        {(sup.projects || []).map((project) => {
                          const key = `${sup.supervisorId}::${project.projectId}`;

                          return (
                            <div key={project.projectId} className="project-block">
                              <strong>
                                <input
                                  type="checkbox"
                                  checked={!!selectedProjects[key]}
                                  onChange={() =>
                                    toggleProjectSelect(sup.supervisorId, project.projectId)
                                  }
                                  disabled={project.isLead}
                                />{" "}
                                {project.projectName} {project.isLead && "(Lead)"}
                              </strong>

                              <ul>
                                {(project.tasks || []).map((task) => (
                                  <li key={task.id}>{task.name}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </td>

                      <td className="actions">
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveClick(sup)}
                          disabled={sup.projects.some((p) => p.isLead)}
                        >
                          <FiTrash2 /> Remove
                        </button>

                        <button
                          className={`suspend-btn ${
                            sup.suspended ? "retain" : "suspend"
                          }`}
                          onClick={() => toggleSuspend(sup)}
                          disabled={sup.projects.some((p) => p.isLead)}
                        >
                          {sup.suspended ? <><FiCheck /> Retain</> : <><FiSlash /> Suspend</>}
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
          )}
        </section>

        {showConfirm && (
          <ConfirmDialog
            title="Confirm Removal"
            message={`Remove selected projects for ${currentSupervisor.fullName}?`}
            onConfirm={confirmRemove}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </main>
    </div>
  );
};

export default SupervisorsList;
