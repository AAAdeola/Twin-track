import React, { useState } from "react";
import {
  FiSearch,
  FiBell,
  FiUser,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useParams, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import AddNewTask from "../Add-New-Task/Add-New-Task";
import WorkLogDetails from "../WorkLogDetails/WorkLogDetails";
import WorkersModal from "../WorkersModal/WorkersModal";
import "./ProjectDashboard.css";

const tabs = ["Summary", "Tasks", "Work Logs", "Attendance"];

const ProjectDashboard = () => {
  const { id } = useParams();
  const location = useLocation();

  const project = location.state?.project || {
    id,
    name: "Unknown Project",
    code: `PRJ-${id}`,
    status: "Active",
    workers: [],
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Summary");
  const [selectedTask, setSelectedTask] = useState(null);

  const tasks = [
    {
      id: 1,
      name: "Foundation Pour",
      assigned: "John D. & Sarah K.",
      workers: [
        "Ahmed",
        "Saeed",
        "Tola",
        "Zain",
        "Lara",
        "Kemi",
        "James",
        "Mary",
      ],
      due: "2024-08-10",
      status: "Completed",
      avatarBg: "#FEEBC8",
      initials: "FD",
    },
    {
      id: 2,
      name: "Framing Installation",
      assigned: "Mark L.",
      workers: ["Saeed", "Usman", "Zain", "Fatima", "Lara"],
      due: "2024-09-01",
      status: "In Progress",
      avatarBg: "#CFFAFE",
      initials: "FI",
    },
  ];

  const formatWorkers = (workers) => {
    if (!workers || workers.length === 0) return "No workers assigned";
    if (workers.length <= 2) return workers.join(", ");
    return `${workers[0]}, ${workers[1]} and ${workers.length - 2} other${workers.length - 2 > 1 ? "s" : ""
      }`;
  };

  const allWorkers = new Set();
  project.workers?.forEach((w) => allWorkers.add(w));
  tasks.forEach((task) => task.workers?.forEach((w) => allWorkers.add(w)));
  const totalWorkers = allWorkers.size;

  const openWorkersModal = (task) => setSelectedTask(task);
  const closeWorkersModal = () => setSelectedTask(null);

  return (
    <div className="tt-dashboard">
      <Sidebar />

      <main className="tt-main">
        {/* Topbar */}
        <div className="tt-topbar">
          <div className="tt-topbar-left">
            <h1 className="tt-project-title">{project.name}</h1>
            <div className="tt-project-meta">
              <span className="tt-project-id">{project.code}</span>
              <span className={`tt-badge ${project.status.toLowerCase()}`}>
                {project.status}
              </span>
            </div>
          </div>

          <div className="tt-topbar-right">
            <div className="tt-search">
              <FiSearch className="tt-search-icon" />
              <input className="tt-search-input" placeholder="Search tasks" />
            </div>
            <button className="icon-btn" aria-label="notifications">
              <FiBell />
              <span className="notif-dot" />
            </button>
            <button className="icon-btn" aria-label="profile">
              <FiUser />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tt-card">
          <div className="tt-card-top">
            <div className="tt-tabs">
              {tabs.map((t) => (
                <button
                  key={t}
                  className={`tt-tab ${activeTab === t ? "active" : ""}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <button className="tt-add-btn" onClick={() => setIsModalOpen(true)}>
                + Add New Task
              </button>
            </div>
          </div>

          <div className="tt-card-body">
            {activeTab === "Summary" && (
              <div className="tt-summary">
                <h3>Project Summary</h3>
                <p className="muted">Overview of project tasks and progress.</p>

                <div className="tt-project-info">
                  <p>
                    <strong>Project Code:</strong> {project.code}
                  </p>
                  <p>
                    <strong>Status:</strong> {project.status}
                  </p>
                  <p>
                    <strong>Total Workers:</strong> {totalWorkers}
                  </p>
                </div>
              </div>
            )}

            {(activeTab === "Tasks" || activeTab === "Summary") && (
              <div className="tt-tasks-table-wrap">
                <table className="tt-tasks-table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Assigned</th>
                      <th>Workers</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="task-name-cell">
                          <div
                            className="avatar"
                            style={{ background: task.avatarBg }}
                          >
                            {task.initials}
                          </div>
                          <div>
                            <div className="task-name">{task.name}</div>
                            <div className="task-sub muted">{task.assigned}</div>
                          </div>
                        </td>
                        <td>{task.assigned}</td>
                        <td
                          className="workers-cell clickable"
                          onClick={() => openWorkersModal(task)}
                        >
                          {formatWorkers(task.workers)}
                        </td>
                        <td>{task.due}</td>
                        <td>
                          <span
                            className={`status-pill ${task.status === "Completed"
                                ? "completed"
                                : task.status === "In Progress"
                                  ? "inprogress"
                                  : "pending"
                              }`}
                          >
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "Work Logs" && <WorkLogDetails />}
            {activeTab === "Attendance" && (
              <div style={{ padding: 24, color: "#6b7280" }}>
                Attendance content coming soon.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Workers Modal */}
      {selectedTask && (
        <WorkersModal task={selectedTask} onClose={closeWorkersModal} />
      )}

      {isModalOpen && <AddNewTask onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ProjectDashboard;
