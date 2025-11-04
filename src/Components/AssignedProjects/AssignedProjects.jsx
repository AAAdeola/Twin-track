import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { FiBriefcase, FiUsers, FiCalendar } from "react-icons/fi";
import "./AssignedProjects.css";

const AssignedProjects = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadAssignedProjects();
  }, []);

  const loadAssignedProjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/my-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!data.isSuccess) return;

      // ✅ filter assigned only
      const assignedOnly = data.data.filter(
        (p) => p.createdBy !== userId
      );

      setProjects(assignedOnly);
    } catch (err) {
      console.error("Error loading assigned projects", err);
    }
  };

  const openProject = (projectId) => {
    navigate(`/assigned-project/${projectId}/${userId}`);
  };

  return (
    <div className="tt-dashboard">
      <Sidebar />

      <main className="tt-main">
        <h1 className="page-title">Assigned Projects</h1>
        <p className="muted">Projects you are supervising under another lead</p>

        <div className="assigned-projects-grid">
          {projects.length === 0 && <p>No assigned projects yet.</p>}

          {projects.map((proj) => (
            <div
              key={proj.id}
              className="assigned-project-card"
              onClick={() => openProject(proj.id)}
            >
              <h2>
                <FiBriefcase /> {proj.name}
              </h2>

              <p className="muted">{proj.description || "No description"}</p>

              <span className="status-pill">{proj.status}</span>

              <p className="muted">
                <FiCalendar />
                Start: {new Date(proj.startDate).toLocaleDateString()}
              </p>

              <div className="view-btn">View Project →</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AssignedProjects;
