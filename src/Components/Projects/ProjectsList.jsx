import React, { useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiBell,
  FiUser,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import AddNewProject from "../Add-New-Project/AddNewProject";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import UpdateProjectMaterialsModal from "../UpdateProjectMaterialsModal/UpdateProjectMaterialsModal";
import ViewAllMaterialsModal from "../ViewAllMaterialsModal/ViewAllMaterialsModal";
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
      materials: [
        { name: "Cement", quantity: 30 },
        { name: "Steel Rods", quantity: 15 },
        { name: "Bricks", quantity: 200 },
        { name: "Concrete", quantity: 40 },
      ],
    },
    {
      id: 2,
      name: "Bridge Repair Project",
      supervisors: ["John Doe"],
      status: "Pending",
      startDate: "2025-10-10",
      materials: [{ name: "Concrete", quantity: 20 }],
    },
    {
      id: 3,
      name: "Residential Villa Build",
      supervisors: ["Mark Brown", "Linda White"],
      status: "Completed",
      startDate: "2025-09-15",
      materials: [],
    },
  ]);

  const [availableMaterials] = useState([
    { name: "Cement", quantity: 100 },
    { name: "Steel Rods", quantity: 50 },
    { name: "Bricks", quantity: 500 },
    { name: "Concrete", quantity: 80 },
  ]);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showViewMaterialsModal, setShowViewMaterialsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleCreateProject = (newProject) => {
    const project = {
      id: projects.length + 1,
      ...newProject,
      name: newProject.name || newProject.projectName,
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

  const handleUpdateMaterials = (project, updates) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === project.id) {
        const updatedMaterials = [...p.materials];

        updates.forEach((u) => {
          const existing = updatedMaterials.find((m) => m.name === u.name);
          if (existing) {
            existing.quantity += u.quantity;
          } else {
            updatedMaterials.push({ name: u.name, quantity: u.quantity });
          }
        });

        return { ...p, materials: updatedMaterials };
      }
      return p;
    });

    setProjects(updatedProjects);
  };

  const filteredProjects = projects.filter((proj) => {
    const projectName = proj.name || proj.projectName || "";
    const matchesSearch = projectName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

        <div className="tt-filters">
          <div className="tt-search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="tt-filter-box">
            <FiFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            className="tt-add-btn"
            onClick={() => setIsAddProjectOpen(true)}
          >
            <FiPlus /> Add New Project
          </button>
        </div>

        <div className="tt-card">
          <div className="tt-card-top">
            <h2>All Projects</h2>
          </div>

          <div className="tt-card-body">
            <div className="tt-projects-grid">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((proj) => {
                  const materialsToShow = proj.materials.slice(0, 2);
                  const remainingCount =
                    proj.materials.length - materialsToShow.length;

                  return (
                    <div
                      key={proj.id}
                      className="tt-project-card large"
                      onClick={() => handleCardClick(proj)}
                    >
                      <div className="tt-project-header">
                        <h3>{proj.name || proj.projectName}</h3>
                        <span
                          className={`status-pill ${
                            proj.status?.toLowerCase() === "active"
                              ? "completed"
                              : proj.status?.toLowerCase() === "pending"
                              ? "inprogress"
                              : "pending"
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>

                      <p className="muted">
                        <strong>Supervisors:</strong>{" "}
                        {proj.supervisors?.join(", ") || "None"}
                      </p>
                      <p className="muted start-date">
                        <FiCalendar /> Start: {proj.startDate || "Not set"}
                      </p>

                      <div className="tt-materials-section">
                        {proj.materials.length > 0 ? (
                          <div className="materials-list">
                            <h4>Materials:</h4>
                            <ul>
                              {materialsToShow.map((mat, idx) => (
                                <li key={idx}>
                                  {mat.name} – <strong>{mat.quantity}</strong>
                                </li>
                              ))}
                              {remainingCount > 0 && (
                                <li
                                  className="muted small view-more"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProject(proj);
                                    setShowViewMaterialsModal(true);
                                  }}
                                >
                                  and {remainingCount} more...
                                </li>
                              )}
                            </ul>
                          </div>
                        ) : (
                          <p className="muted no-mat">
                            No materials assigned yet
                          </p>
                        )}
                      </div>

                      <div className="project-actions">
                        <button
                          className="increase-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(proj);
                            setShowUpdateModal(true);
                          }}
                        >
                          <FiPlus /> Add / Increase Materials
                        </button>

                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(proj);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-projects">No projects found.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {isAddProjectOpen && (
        <AddNewProject
          onClose={() => setIsAddProjectOpen(false)}
          onCreate={handleCreateProject}
          availableMaterials={availableMaterials}
        />
      )}

      {showUpdateModal && selectedProject && (
        <UpdateProjectMaterialsModal
          project={selectedProject}
          availableMaterials={availableMaterials}
          onUpdate={(updates) =>
            handleUpdateMaterials(selectedProject, updates)
          }
          onClose={() => setShowUpdateModal(false)}
        />
      )}

      {showViewMaterialsModal && selectedProject && (
        <ViewAllMaterialsModal
          project={selectedProject}
          onClose={() => setShowViewMaterialsModal(false)}
        />
      )}

      {showDeleteModal && projectToDelete && (
        <ConfirmDialog
          title="Confirm Deletion"
          message={`Are you sure you want to delete "${projectToDelete.name || projectToDelete.projectName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectsList;
