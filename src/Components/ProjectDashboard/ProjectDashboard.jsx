import React, { useState } from "react";
import { FiSearch, FiBell, FiUser } from "react-icons/fi";
import { useParams, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import AddNewTask from "../Add-New-Task/Add-New-Task";
import WorkLogDetails from "../WorkLogDetails/WorkLogDetails";
import WorkersModal from "../WorkersModal/WorkersModal";
import UsedAllMaterialsModal from "../UsedAllMaterialsModal/UsedAllMaterialsModal";
import RemainingMaterialsModal from "../RemainingMaterialsModal/RemainingMaterialsModal";
import MaterialsModal from "../TaskMaterialsModal/TaskMaterialsModal";
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
    materials: [
      { name: "Cement", quantity: 50 },
      { name: "Sand", quantity: 30 },
      { name: "Iron Rods", quantity: 20 },
    ],
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Summary");
  const [selectedTask, setSelectedTask] = useState(null);
  const [usedAllModalTask, setUsedAllModalTask] = useState(null);
  const [remainingModalTask, setRemainingModalTask] = useState(null);
  const [materialsModalTask, setMaterialsModalTask] = useState(null);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Foundation Pour",
      assigned: "John D. & Sarah K.",
      workers: ["Ahmed", "Saeed", "Tola", "Zain", "Lara", "Kemi"],
      due: "2024-08-10",
      status: "Completed",
      avatarBg: "#FEEBC8",
      initials: "FD",
      materials: [
        { name: "Cement", quantity: 10 },
        { name: "Sand", quantity: 5 },
        { name: "Iron Rods", quantity: 2 },
      ],
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
      materials: [
        { name: "Cement", quantity: 4 },
        { name: "Iron Rods", quantity: 6 },
        { name: "Wood Panels", quantity: 12 },
        { name: "Nails", quantity: 100 },
        { name: "Paint", quantity: 10 },
        { name: "Bricks", quantity: 200 },
      ],
    },
  ]);

  const formatWorkers = (workers) => {
    if (!workers || workers.length === 0) return "No workers assigned";
    if (workers.length <= 2) return workers.join(", ");
    return `${workers[0]}, ${workers[1]} and ${
      workers.length - 2
    } other${workers.length - 2 > 1 ? "s" : ""}`;
  };

  const allWorkers = new Set();
  project.workers?.forEach((w) => allWorkers.add(w));
  tasks.forEach((task) => task.workers?.forEach((w) => allWorkers.add(w)));
  const totalWorkers = allWorkers.size;

  const openWorkersModal = (task) => setSelectedTask(task);
  const closeWorkersModal = () => setSelectedTask(null);

  const handleUsedAllUpdate = (usedMaterials) => {
    const updatedTasks = tasks.map((task) =>
      task.id === usedAllModalTask.id
        ? {
            ...task,
            materials: task.materials.filter(
              (m) => !usedMaterials.find((u) => u.name === m.name)
            ),
          }
        : task
    );
    setTasks(updatedTasks);

    usedMaterials.forEach((u) => {
      const mat = project.materials.find((m) => m.name === u.name);
      if (mat) mat.quantity -= u.quantityUsed;
    });
  };

  const handleRemainingUpdate = (updatedMaterial) => {
    const updatedTasks = tasks.map((task) =>
      task.id === remainingModalTask.id
        ? {
            ...task,
            materials: task.materials.map((m) =>
              m.name === updatedMaterial.name
                ? { ...m, quantity: updatedMaterial.remaining }
                : m
            ),
          }
        : task
    );
    setTasks(updatedTasks);

    const mat = project.materials.find(
      (m) => m.name === updatedMaterial.name
    );
    if (mat) mat.quantity -= updatedMaterial.quantityUsed;
  };

  return (
    <div className="tt-dashboard">
      <Sidebar />

      <main className="tt-main">
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
            <button className="icon-btn">
              <FiBell />
              <span className="notif-dot" />
            </button>
            <button className="icon-btn">
              <FiUser />
            </button>
          </div>
        </div>

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
            {(activeTab === "Tasks" || activeTab === "Summary") && (
              <div className="tt-tasks-table-wrap">
                <table className="tt-tasks-table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Assigned</th>
                      <th>Workers</th>
                      <th>Materials</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
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
                        <td
                          className="clickable"
                          onClick={() => setMaterialsModalTask(task)}
                        >
                          {task.materials && task.materials.length > 0 ? (
                            task.materials.length <= 2 ? (
                              task.materials.map((m) => m.name).join(", ")
                            ) : (
                              `${task.materials[0].name}, ${
                                task.materials[1].name
                              } and ${task.materials.length - 2} others`
                            )
                          ) : (
                            <span className="muted">No materials</span>
                          )}
                        </td>
                        <td>{task.due}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              task.status === "Completed"
                                ? "completed"
                                : task.status === "In Progress"
                                ? "inprogress"
                                : "pending"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="tt-small-btn used"
                            onClick={() => setUsedAllModalTask(task)}
                          >
                            Used All
                          </button>
                          <button
                            className="tt-small-btn remain"
                            onClick={() => setRemainingModalTask(task)}
                          >
                            Remaining
                          </button>
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

      {selectedTask && <WorkersModal task={selectedTask} onClose={closeWorkersModal} />}
      {isModalOpen && <AddNewTask onClose={() => setIsModalOpen(false)} />}

      {usedAllModalTask && (
        <UsedAllMaterialsModal
          task={usedAllModalTask}
          project={project}
          onUpdate={handleUsedAllUpdate}
          onClose={() => setUsedAllModalTask(null)}
        />
      )}

      {remainingModalTask && (
        <RemainingMaterialsModal
          task={remainingModalTask}
          project={project}
          onUpdate={handleRemainingUpdate}
          onClose={() => setRemainingModalTask(null)}
        />
      )}

      {materialsModalTask && (
        <MaterialsModal
          task={materialsModalTask}
          onClose={() => setMaterialsModalTask(null)}
        />
      )}
    </div>
  );
};

export default ProjectDashboard;