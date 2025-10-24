import React, { useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiBell,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar"; // ✅ Reusable Sidebar import
import AddNewProject from "../Add-New-Project/AddNewProject";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./ProjectsList.css";

const ProjectsList = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "TwinTrack Construction",
      supervisors: ["Michael Green", "Sarah Paul"],
      status: "Active",
      startDate: "2025-09-01",
    },
    {
      id: 2,
      name: "Bridge Repair Project",
      supervisors: ["John Doe"],
      status: "Pending",
      startDate: "2025-10-10",
    },
    {
      id: 3,
      name: "Residential Villa Build",
      supervisors: ["Mark Brown", "Linda White"],
      status: "Active",
      startDate: "2025-09-15",
    },
  ]);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleCreateProject = (newProject) => {
    const project = {
      id: projects.length + 1,
      ...newProject,
    };
    setProjects([...projects, project]);
  };

  const handleDelete = () => {
    if (projectToDelete) {
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const handleCardClick = (project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };

  return (
    <div className="tt-dashboard">
      <Sidebar activePage="projects" />

      <main className="tt-main">
        <div className="tt-topbar">
          <div className="tt-topbar-left">
            <h1 className="tt-page-title">Projects</h1>
            <p className="muted">Manage and monitor all your active projects</p>
          </div>

          <div className="tt-topbar-right">
            <button className="icon-btn" aria-label="notifications">
              <FiBell />
              <span className="notif-dot" />
            </button>
            <button className="icon-btn" aria-label="profile">
              <FiUser />
            </button>
          </div>
        </div>

        <div className="tt-card">
          <div className="tt-card-top">
            <h2>All Projects</h2>
            <button
              className="tt-add-btn"
              onClick={() => setIsAddProjectOpen(true)}
            >
              <FiPlus /> Add New Project
            </button>
          </div>

          <div className="tt-card-body">
            <div className="tt-projects-grid">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="tt-project-card"
                  onClick={() => handleCardClick(proj)}
                >
                  <div className="tt-project-header">
                    <h3>{proj.name}</h3>
                    <span
                      className={`status-pill ${
                        proj.status.toLowerCase() === "active"
                          ? "completed"
                          : proj.status.toLowerCase() === "pending"
                          ? "inprogress"
                          : "pending"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <p className="muted">
                    <strong>Supervisors:</strong> {proj.supervisors.join(", ")}
                  </p>
                  <p className="muted">
                    <FiCalendar /> Start: {proj.startDate}
                  </p>

                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(proj);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isAddProjectOpen && (
        <AddNewProject
          onClose={() => setIsAddProjectOpen(false)}
          onCreate={handleCreateProject}
        />
      )}

      {showDeleteModal && projectToDelete && (
        <ConfirmDialog
          title="Confirm Deletion"
          message={`Are you sure you want to delete "${projectToDelete.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectsList;
