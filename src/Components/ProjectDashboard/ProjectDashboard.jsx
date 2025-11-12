import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

import {
  FiSearch,
  FiBell,
  FiUser,
  FiPlus,
  FiChevronLeft,
  FiPlusCircle,
} from "react-icons/fi";

import { toast } from "react-toastify";
import "./ProjectDashboard.css";

import ModalShell from "../Modals/ModalShell";
import AddTaskModal from "../Modals/Add-New-Task";
import AssignWorkerToProjectModal from "../Modals/AssignWorkerToProjectModal";
import AssignWorkerToTaskModal from "../Modals/AssignWorkerModal";
import AssignSupervisorModal from "../Modals/AssignSupervisorModal";
import MaterialsModal from "../Modals/MaterialsModal";
import ProjectMaterialsModal from "../Modals/ProjectMaterialsModal";
import TaskMaterialsModal from "../TaskMaterialsModal/TaskMaterialsModal";

// Your provided modal (separate file)
import IncreaseMaterialModal from "../IncreaseMaterialModal/IncreaseMaterialModal";

const tabs = ["Tasks", "Work Logs", "Materials", "Attendance"];

const ProjectDashboard = () => {
  const { id: projectId, userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  const token = localStorage.getItem("authToken");
  const storedUserId = localStorage.getItem("userId");
  const userId = routeUserId || storedUserId;

  const [project, setProject] = useState(
    location.state?.project ?? {
      id: projectId,
      name: "Loading...",
      description: "",
      status: "Unknown",
      code: projectId ? `PRJ-${projectId}` : "PRJ-UNKNOWN",
      materials: [],
    }
  );

  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState({ supervisors: [], workers: [] });

  const [activeTab, setActiveTab] = useState("Tasks");

  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  /* Modals state */
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [showWorkerAssign, setShowWorkerAssign] = useState(false);
  const [assignWorkerTask, setAssignWorkerTask] = useState(null);
  const [showSupervisorAssign, setShowSupervisorAssign] = useState(false);
  const [selectedTaskForWorkers, setSelectedTaskForWorkers] = useState(null);
  const [selectedTaskMaterials, setSelectedTaskMaterials] = useState(null);
  const [showProjectMaterialsModal, setShowProjectMaterialsModal] = useState(false);
  const [taskMaterialsView, setTaskMaterialsView] = useState(null);

  /* Increase material modal state */
  const [showIncreaseModal, setShowIncreaseModal] = useState(false);
  const [materialToIncrease, setMaterialToIncrease] = useState(null);

  /* Worker / supervisor lists */
  const [allWorkers, setAllWorkers] = useState([]);
  const [projectWorkers, setProjectWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    fetchProject();
    fetchTasks();
    fetchAssignments();
    fetchProjectMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const authHeaders = () =>
    token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

  /* FETCH PROJECT */
  const fetchProject = async () => {
    setLoadingProject(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, { headers: authHeaders() });
      if (!res.ok) {
        toast.warn("Failed to load project.");
        return;
      }
      const payload = await res.json();
      const dto = payload.data ?? payload;
      setProject((prev) => ({
        ...prev,
        id: dto.id,
        name: dto.name,
        description: dto.description,
        status: dto.status,
        materials: dto.materials ?? prev.materials ?? [],
      }));
    } catch (err) {
      console.error("Error loading project:", err);
      toast.error("Error loading project.");
    } finally {
      setLoadingProject(false);
    }
  };

  /* FETCH TASKS */
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/tasks`, { headers: authHeaders() });
      if (!res.ok) {
        toast.warn("Failed to fetch tasks.");
        return;
      }
      const payload = await res.json();
      const list = payload.data ?? payload ?? [];
      const normalized = (Array.isArray(list) ? list : []).map((t) => {
        return {
          id: t.id,
          name: t.name,
          description: t.description,
          due: t.deadLine ? new Date(t.deadLine).toLocaleDateString() : "—",
          status: t.status,
          assignedWorkers: t.assignedWorkers ?? [],
          materials: (t.materials ?? []).map((m) => ({
            id: m.materialId ?? m.id,
            name: m.name,
            quantity: m.quantity,
          })),
          raw: t,
        };
      });
      setTasks(normalized);
    } catch (err) {
      console.error("Failed loading tasks:", err);
      toast.error("Failed loading tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchProjectMaterials = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/materials`, { headers: authHeaders() });
      const payload = await res.json();

      console.log("📦 Project Materials API raw response:", payload); // 🔹 log the full response

      const list = payload.data ?? [];
      console.log("📦 Normalized list from API:", list); // 🔹 log the extracted list

      const normalized = (Array.isArray(list) ? list : []).map((m) => ({
        id: m.materialId ?? m.id ?? crypto.randomUUID(),
        name: m.name ?? "Unnamed Material",  // 🔹 fallback for missing name
        quantity: m.quantity ?? 0,
        availableQuantity: m.availableQuantity ?? m.quantity ?? 0,
        unit: m.unit ?? "",
      }));

      console.log("📦 Final normalized materials:", normalized);

      setProject((prev) => ({ ...prev, materials: normalized }));
    } catch (err) {
      console.error("❌ Failed to load project materials:", err);
      toast.error("Failed to load project materials.");
    }
  };


  /* FETCH ASSIGNMENTS */
  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/assignments`, { headers: authHeaders() });
      if (!res.ok) return;
      const payload = await res.json();
      const data = payload.data ?? payload;
      setAssignments(data);
      setProjectWorkers(data.Workers ?? data.workers ?? []);
    } catch (err) {
      console.error("Error loading assignments:", err);
      toast.error("Error loading assignments.");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchAllWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/worker?page=1&pageSize=200`, { headers: authHeaders() });
      const payload = await res.json();
      const list =
        payload?.data?.items ??
        payload?.items ??
        (Array.isArray(payload?.data) ? payload.data : []) ??
        (Array.isArray(payload) ? payload : []);
      list.forEach((w, i) => {
        console.log(`Worker #${i + 1} ID:`, w.id);
      });
      setAllWorkers(list);
    } catch (err) {
      console.error("Error fetching workers:", err);
      toast.error("Error fetching workers.");
    }
  };

  /* FETCH SUPERVISORS */
  const fetchSupervisors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/supervisors`, { headers: authHeaders() });
      const payload = await res.json();
      setSupervisors(payload.data ?? payload);
    } catch (err) {
      console.error("Error loading supervisors:", err);
      toast.error("Error loading supervisors.");
    }
  };

  /* CREATE TASK */
  const handleCreateTask = async (taskPayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/task/create`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(taskPayload),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.message ?? "Failed to create task.");
        return;
      }
      toast.success("Task created.");
      fetchTasks();
      setIsAddTaskOpen(false);
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Error creating task.");
    }
  };

  /* ASSIGN WORKER TO PROJECT */
  const assignWorkerToProject = async (workerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/assign-worker?workerId=${workerId}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const payload = await res.json();
      if (!res.ok) return toast.error(payload.message);
      toast.success("Worker assigned to project.");
      fetchAssignments();
      setShowWorkerAssign(false);
    } catch (err) {
      console.error("Error assigning worker:", err);
      toast.error("Error assigning worker.");
    }
  };

  const assignWorkerToTaskApi = async (taskId, workerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/task/${taskId}/assign/${workerId}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.message ?? "Failed to assign worker.");
        return;
      }
      toast.success("Worker assigned to task successfully.");
      fetchTasks();
      fetchAssignments();
    } catch (err) {
      console.error(err);
      toast.error("Error assigning worker to task.");
    }
  };

  /* ASSIGN SUPERVISOR */
  const assignSupervisorToProject = async (supervisorId, level = 0) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/assign-supervisor?supervisorId=${supervisorId}&level=${level}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const payload = await res.json();
      if (!res.ok || payload.isSuccess === false) return toast.error(payload.message);
      toast.success("Supervisor assigned.");
      fetchAssignments();
      setShowSupervisorAssign(false);
    } catch (err) {
      console.error("Error assigning supervisor:", err);
      toast.error("Error assigning supervisor.");
    }
  };

  /* ADD PROJECT MATERIAL (unchanged) */
  const addProjectMaterial = async ({ name, TotalQuantity }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/material/create`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, TotalQuantity, projectId }),
      });
      const payload = await res.json();
      if (!res.ok) return toast.error(payload.message);
      toast.success("Material added.");
      fetchProjectMaterials();
    } catch (err) {
      console.error("Error adding material:", err);
      toast.error("Error adding material.");
    }
  };

  /* ASSIGN MATERIALS TO TASK */
  const handleAssignMaterialsToTask = async (taskId, selectedMaterials) => {
    const currentUserId = localStorage.getItem("userId")?.trim().toLowerCase();
    const isSupervisor = assignments.supervisors.some((s) => s.userId?.trim().toLowerCase() === currentUserId);

    if (!isSupervisor) {
      toast.error("You are not a supervisor for this project.");
      return;
    }
    if (!selectedMaterials || selectedMaterials.length === 0) {
      toast.warn("No materials selected.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/task/${taskId}/assign-materials`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ materials: selectedMaterials }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.message ?? "Failed to assign materials.");
        return;
      }
      toast.success("Materials assigned to task.");
      fetchTasks();
      setSelectedTaskMaterials(null);
    } catch (err) {
      console.error("❌ Error assigning materials:", err);
      toast.error("Error assigning materials to task.");
    }
  };

  /* SHOW INCREASE MODAL (opens your external IncreaseMaterialModal) */
  const openIncreaseModal = (material) => {
    setMaterialToIncrease(material);
    setShowIncreaseModal(true);
  };

  const closeIncreaseModal = () => {
    setShowIncreaseModal(false);
    setMaterialToIncrease(null);
  };

  const confirmIncrease = async (materialName, amountToAdd) => {
    const mat = project.materials.find((m) => m.name === materialName);
    if (!mat) {
      toast.error("Material not found.");
      closeIncreaseModal();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/material/increase`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          id: mat.id,
          increaseBy: parseInt(amountToAdd, 10),
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        toast.error(payload.message ?? "Failed to increase material.");
        return;
      }

      toast.success(`Increased ${mat.name} by ${amountToAdd}.`);

      await fetchProjectMaterials();
      fetchTasks();
    } catch (err) {
      console.error("ERROR:", err);
      toast.error("Error increasing material.");
    } finally {
      closeIncreaseModal();
    }
  };

  const increaseMaterial = async (material) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/material/update`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          id: material.id ?? material.materialId,
          quantity: (material.quantity ?? 0) + 1,
        }),
      });
      const payload = await res.json();
      if (!res.ok) return toast.error(payload.message);
      toast.success("Material updated.");
      fetchProject();
    } catch (err) {
      console.error("Error updating material:", err);
      toast.error("Error updating material.");
    }
  };

  /* UI helpers */
  const openAssignWorker = (task) => setAssignWorkerTask(task);
  const openWorkersModal = (task) => setSelectedTaskForWorkers(task);
  const openMaterialsModal = (task) => setSelectedTaskMaterials(task);
  const handleBack = () => navigate(-1);

  return (
    <div className="tt-dashboard">
      <Sidebar userId={userId} />

      <main className="tt-main">
        {/* Top Bar */}
        <div className="tt-topbar">
          <div className="tt-topbar-left">
            <button className="back-btn" onClick={handleBack}>
              <FiChevronLeft />
            </button>

            <div>
              <h1 className="tt-project-title">{project.name}</h1>
              <div className="tt-project-meta">
                <span className="tt-project-id">{project.code}</span>
                <span className={`tt-badge ${String(project.status).toLowerCase()}`}>{project.status}</span>
              </div>
            </div>
          </div>

          <div className="tt-topbar-right">
            <div className="tt-search">
              <FiSearch className="tt-search-icon" />
              <input className="tt-search-input" placeholder="Search tasks..." />
            </div>

            <button className="icon-btn">
              <FiBell />
            </button>

            <button className="icon-btn">
              <FiUser />
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="tt-card">
          <div className="tt-card-top">
            <div className="tt-tabs">
              {tabs.map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} className={`tt-tab ${activeTab === t ? "active" : ""}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="tt-actions-right">
              <button className="tt-add-btn" onClick={() => setIsAddTaskOpen(true)}>
                <FiPlus /> Add Task
              </button>

              <button className="tt-add-btn outline" onClick={() => setShowProjectMaterialsModal(true)}>
                + Project Materials
              </button>

              <button className="tt-add-btn outline" onClick={() => setShowWorkerAssign(true)}>
                + Assign Worker
              </button>

              <button className="tt-add-btn outline" onClick={() => setShowSupervisorAssign(true)}>
                + Assign Supervisor
              </button>
            </div>
          </div>

          <div className="tt-card-body">
            {/* TASKS TABLE */}
            {activeTab === "Tasks" && (
              <div className="tt-tasks-table-wrap">
                {loadingTasks ? (
                  <div className="muted">Loading tasks...</div>
                ) : (
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
                      {tasks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="muted">
                            No tasks found.
                          </td>
                        </tr>
                      ) : (
                        tasks.map((task) => (
                          <tr key={task.id}>
                            <td className="task-name-cell">
                              <div className="task-name">{task.name}</div>
                              <div className="task-sub muted">{task.description}</div>
                            </td>

                            <td>{task.assignedWorkers?.join(", ") || "—"}</td>

                            <td className="clickable" onClick={() => openWorkersModal(task)}>
                              {task.assignedWorkers.length === 0
                                ? "No workers"
                                : task.assignedWorkers.length <= 3
                                  ? task.assignedWorkers.join(", ")
                                  : `${task.assignedWorkers[0]}, ${task.assignedWorkers[1]} and ${task.assignedWorkers.length - 2} others`}
                            </td>

                            <td className="clickable" onClick={() => setTaskMaterialsView(task)}>
                              {task.materials.length === 0
                                ? "No materials"
                                : task.materials.length <= 2
                                  ? task.materials.map((m) => m.name).join(", ")
                                  : `${task.materials[0].name}, ${task.materials[1].name} and ${task.materials.length - 2} more`}
                            </td>

                            <td>{task.due}</td>

                            <td>
                              <span
                                className={`status-pill ${task.status === "Completed" ? "completed" : task.status === "InProgress" ? "inprogress" : "pending"
                                  }`}
                              >
                                {task.status}
                              </span>
                            </td>

                            <td>
                              <button className="tt-small-btn" onClick={() => openAssignWorker(task)}>
                                Assign Worker
                              </button>
                              <button className="tt-small-btn outline" onClick={() => setSelectedTaskMaterials(task)}>
                                Assign Materials
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === "Work Logs" && <div className="muted">Work logs coming soon.</div>}

            {/* MATERIALS TAB - Card Grid Style */}
            {activeTab === "Materials" && (
              <div className="tt-materials-wrap">
                <div className="materials-header">
                  <h2>Project Materials</h2>
                  <p className="muted">Manage and increase your project materials quickly.</p>
                </div>

                {loadingProject && project.materials.length === 0 ? <div className="muted">Loading materials...</div> : null}

                <div className="materials-grid">
                  {(project.materials || []).length === 0 ? (
                    <div className="muted">No materials yet.</div>
                  ) : (
                    (project.materials || []).map((m) => (
                      <div className="material-card" key={m.id}>
                        <div className="material-card-top">
                          <div className="material-name">{m.name}</div>
                          <div className="material-unit">{m.unit ? m.unit : ""}</div>
                        </div>

                        <div className="material-qty">
                          <div className="qty-label">Quantity</div>
                          <div className="qty-value">{m.quantity ?? 0}</div>
                        </div>

                        <div className="material-available">
                          <div className="small muted">Available</div>
                          <div className="avail-value">{m.availableQuantity ?? m.quantity ?? 0}</div>
                        </div>

                        <div className="material-actions">
                          <button className="tt-small-btn" onClick={() => openIncreaseModal(m)} title="Increase quantity">
                            <FiPlusCircle /> Increase
                          </button>

                          <button
                            className="tt-small-btn outline"
                            onClick={() => {
                              // quick +1 if you still want a quick action
                              confirmIncrease(m.name, 1);
                            }}
                            title="Quick +1"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "Attendance" && <div className="muted">Attendance coming soon.</div>}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isAddTaskOpen && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setIsAddTaskOpen(false)}
          onCreate={handleCreateTask}
          fetchProjectWorkers={fetchAssignments}
          projectWorkers={projectWorkers}
        />
      )}

      {selectedTaskMaterials && (
        <MaterialsModal onClose={() => setSelectedTaskMaterials(null)} materials={project.materials} task={selectedTaskMaterials} onAssign={handleAssignMaterialsToTask} />
      )}

      {showWorkerAssign && (
        <AssignWorkerToProjectModal onClose={() => setShowWorkerAssign(false)} onAssign={assignWorkerToProject} fetchAllWorkers={fetchAllWorkers} allWorkers={allWorkers} />
      )}

      {assignWorkerTask && (
        <AssignWorkerToTaskModal
          task={assignWorkerTask}
          onClose={() => setAssignWorkerTask(null)}
          onAssign={(workerId) => assignWorkerToTaskApi(assignWorkerTask.id, workerId)}
          projectWorkers={projectWorkers}
          fetchProjectWorkers={fetchAssignments}
        />
      )}

      {showSupervisorAssign && (
        <AssignSupervisorModal supervisors={supervisors} fetchSupervisors={fetchSupervisors} onClose={() => setShowSupervisorAssign(false)} onAssign={assignSupervisorToProject} />
      )}

      {selectedTaskForWorkers && (
        <ModalShell title={`Workers — ${selectedTaskForWorkers.name}`} onClose={() => setSelectedTaskForWorkers(null)}>
          <ul>
            {selectedTaskForWorkers.assignedWorkers.length === 0 ? <li className="muted">No workers assigned</li> : selectedTaskForWorkers.assignedWorkers.map((w, i) => <li key={i}>{w}</li>)}
          </ul>

          <div className="pd-modal-actions">
            <button className="btn btn-outline" onClick={() => setSelectedTaskForWorkers(null)}>
              Close
            </button>
          </div>
        </ModalShell>
      )}

      {showProjectMaterialsModal && (
        <ProjectMaterialsModal onClose={() => setShowProjectMaterialsModal(false)} projectId={projectId} materials={project.materials} onAddMaterial={addProjectMaterial} onIncrease={increaseMaterial} />
      )}

      {taskMaterialsView && <TaskMaterialsModal task={taskMaterialsView} project={project} onClose={() => setTaskMaterialsView(null)} />}

      {/* Increase material modal (your separate component file) */}
      {showIncreaseModal && materialToIncrease && (
        <IncreaseMaterialModal material={materialToIncrease} onClose={closeIncreaseModal} onIncrease={confirmIncrease} />
      )}
    </div>
  );
};

export default ProjectDashboard;
