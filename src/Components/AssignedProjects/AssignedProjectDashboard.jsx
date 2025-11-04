import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import {
  FiUsers,
  FiCheckCircle,
  FiBook,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";

import "./AssignedProjectDashboard.css";

const AssignedProjectDashboard = () => {
  const { projectId, userId } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const token = localStorage.getItem("authToken");

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  useEffect(() => {
    loadProject();
    loadAssignments();
  }, []);

  const loadProject = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.isSuccess) setProject(data.data);
    } catch (err) {
      console.error("Error loading project", err);
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/assignments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.isSuccess) {
        setWorkers(data.data.workers);
        setSupervisors(data.data.supervisors);
      }
    } catch (err) {
      console.error("Error loading assignments", err);
    }

    // Load tasks
    try {
      const t = await fetch(
        `${API_BASE_URL}/api/v1/tasks/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const tData = await t.json();

      if (tData.isSuccess) setTasks(tData.data);
    } catch (err) {
      console.error("Error loading tasks", err);
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="tt-dashboard">
      <Sidebar userId={userId} />

      <main className="tt-main assigned-d-main">
        <h1 className="assigned-title">{project.name}</h1>
        <p className="muted">{project.description}</p>

        {/* Project Summary Cards */}
        <div className="assigned-summary-cards">
          <div className="assigned-card">
            <FiUsers className="assigned-icon" />
            <h3>{workers.length}</h3>
            <p>Workers</p>
          </div>

          <div className="assigned-card">
            <FiBook className="assigned-icon" />
            <h3>{tasks.length}</h3>
            <p>Total Tasks</p>
          </div>

          <div className="assigned-card">
            <FiCheckCircle className="assigned-icon" />
            <h3>{tasks.filter(t => t.status === "Completed").length}</h3>
            <p>Completed Tasks</p>
          </div>

          <div className="assigned-card">
            <FiBarChart2 className="assigned-icon" />
            <h3>{project.status}</h3>
            <p>Project Status</p>
          </div>
        </div>

        {/* Supervisors Section */}
        <div className="assigned-section">
          <h2>Supervisors</h2>
          <ul className="assigned-list">
            {supervisors.map((sup) => (
              <li key={sup.supervisorId}>
                ✅ {sup.fullName} ({sup.role})
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks Section */}
        <div className="assigned-section">
          <h2>Tasks</h2>

          {tasks.length === 0 ? (
            <p className="muted">No tasks have been added yet.</p>
          ) : (
            <div className="assigned-tasks-grid">
              {tasks.map((t) => (
                <div key={t.id} className="assigned-task-card">
                  <h3>{t.name}</h3>
                  <p className="muted">{t.description}</p>
                  <span className={`task-status ${t.status.toLowerCase()}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workers Section */}
        <div className="assigned-section">
          <h2>Workers Assigned</h2>

          {workers.length === 0 ? (
            <p className="muted">No workers assigned.</p>
          ) : (
            <ul className="assigned-list">
              {workers.map((w) => (
                <li key={w.workerId}>
                  👷 {w.fullName}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignedProjectDashboard;
