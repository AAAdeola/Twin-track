import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";

import {
  FiSearch,
  FiBell,
  FiUser,
  FiPlus,
  FiChevronLeft,
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

/* ✅ Tabs setup */
const tabs = ["Summary", "Tasks", "Work Logs", "Materials", "Attendance"];

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

  const [activeTab, setActiveTab] = useState("Summary");

  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  /* ✅ Modal state */
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [showWorkerAssign, setShowWorkerAssign] = useState(false);
  const [assignWorkerTask, setAssignWorkerTask] = useState(null);
  const [showSupervisorAssign, setShowSupervisorAssign] = useState(false);
  const [selectedTaskForWorkers, setSelectedTaskForWorkers] = useState(null);
  const [selectedTaskMaterials, setSelectedTaskMaterials] = useState(null);
  const [showProjectMaterialsModal, setShowProjectMaterialsModal] = useState(false);
  const [taskMaterialsView, setTaskMaterialsView] = useState(null);

  /* ✅ Worker / supervisor lists */
  const [allWorkers, setAllWorkers] = useState([]);
  const [projectWorkers, setProjectWorkers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    fetchProject();
    fetchTasks();
    fetchAssignments();
    fetchProjectMaterials();
  }, [projectId]);

  const authHeaders = () =>
    token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };

  /* ✅ FETCH PROJECT */
  const fetchProject = async () => {
    setLoadingProject(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        headers: authHeaders(),
      });

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
        materials: dto.materials ?? [],
      }));
    } catch {
      toast.error("Error loading project.");
    } finally {
      setLoadingProject(false);
    }
  };

  /* ✅ FETCH TASKS */
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/tasks`, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        toast.warn("Failed to fetch tasks.");
        return;
      }


      const payload = await res.json();
      const list = payload.data ?? payload;

      const normalized = (Array.isArray(list) ? list : []).map((t) => {

        // ✅ ADD LOGS HERE
        console.log("📌 Raw task from backend:", t);
        console.log("📌 taskMaterials:", t.taskMaterials);

        return {
          id: t.id,
          name: t.name,
          description: t.description,
          due: t.deadLine ? new Date(t.deadLine).toLocaleDateString() : "—",
          status: t.status,
          assignedWorkers: t.assignedWorkers ?? [],
          materials: (t.materials ?? []).map((m) => ({
            id: m.materialId,
            name: m.name,          // backend uses name ✅
            quantity: m.quantity,
          })),
          raw: t,
        };
      });



      setTasks(normalized);
    } catch {
      toast.error("Failed loading tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  // const fetchProjectMaterials = async () => {
  //   try {
  //     const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/materials`, {
  //       headers: authHeaders(),
  //     });

  //     const payload = await res.json();
  //     const list = payload.data ?? payload ?? [];

  //     setProject((prev) => ({
  //       ...prev,
  //       materials: list,
  //     }));
  //   } catch (err) {
  //     toast.error("Failed to load project materials.");
  //   }
  // };

  const fetchProjectMaterials = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/materials`, {
        headers: authHeaders(),
      });

      const payload = await res.json();
      console.log("📦 Project Materials API raw response:", payload);

      const list = payload.data ?? [];
      console.log("📦 Extracted materials list:", list);

      const normalized = list.map((m) => ({
        id: m.materialId ?? m.id,
        name: m.name,
        quantity: m.quantity,
        availableQuantity: m.availableQuantity ?? m.quantity,
      }));


      console.log("📦 Normalized materials list:", normalized);

      // Update project state with normalized materials
      setProject((prev) => ({
        ...prev,
        materials: normalized,
      }));
    } catch (err) {
      console.error("❌ Failed to load project materials:", err);
      toast.error("Failed to load project materials.");
    }
  };

  /* ✅ FETCH ASSIGNMENTS */
  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/assignments`, {
        headers: authHeaders(),
      });

      if (!res.ok) return;

      const payload = await res.json();
      const data = payload.data ?? payload;

      console.log("✅ Assignments payload:", data);

      setAssignments(data);
      setProjectWorkers(data.Workers ?? data.workers ?? []);
    } catch {
      toast.error("Error loading assignments.");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchAllWorkers = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/worker?page=1&pageSize=200`,
        { headers: authHeaders() }
      );

      const payload = await res.json();

      console.log("✅ Workers API full payload:", payload);

      const list =
        payload?.data?.items ??
        payload?.items ??
        (Array.isArray(payload?.data) ? payload.data : []) ??
        (Array.isArray(payload) ? payload : []);

      console.log("✅ Extracted workers list:", list);

      // ✅ Log each worker's ID clearly
      list.forEach((w, i) => {
        console.log(`Worker #${i + 1} ID:`, w.id);
      });

      setAllWorkers(list);
    } catch (err) {
      toast.error("Error fetching workers.");
    }
  };

  /* ✅ FETCH SUPERVISORS */
  const fetchSupervisors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/supervisors`, { headers: authHeaders() });
      const payload = await res.json();
      setSupervisors(payload.data ?? payload);
    } catch {
      toast.error("Error loading supervisors.");
    }
  };

  /* ✅ CREATE TASK */
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
    } catch {
      toast.error("Error creating task.");
    }
  };

  /* ✅ ASSIGN WORKER TO PROJECT */
  const assignWorkerToProject = async (workerId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/assign-worker?workerId=${workerId}`,
        { method: "POST", headers: authHeaders() }
      );

      const payload = await res.json();
      if (!res.ok) return toast.error(payload.message);

      toast.success("Worker assigned to project.");
      fetchAssignments();
      setShowWorkerAssign(false);
    } catch {
      toast.error("Error assigning worker.");
    }
  };

  const assignWorkerToTaskApi = async (taskId, workerId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/task/${taskId}/assign/${workerId}`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );

      const payload = await res.json();

      if (!res.ok) {
        toast.error(payload.message ?? "Failed to assign worker.");
        return;
      }

      toast.success("Worker assigned to task successfully.");
      fetchTasks(); // refresh tasks
      fetchAssignments(); // refresh workers
    } catch (err) {
      console.error(err);
      toast.error("Error assigning worker to task.");
    }
  };


  /* ✅ ASSIGN SUPERVISOR */
  const assignSupervisorToProject = async (supervisorId, level = 0) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/assign-supervisor?supervisorId=${supervisorId}&level=${level}`,
        { method: "POST", headers: authHeaders() }
      );

      const payload = await res.json();
      if (!res.ok || payload.isSuccess === false)
        return toast.error(payload.message);

      toast.success("Supervisor assigned.");
      fetchAssignments();
      setShowSupervisorAssign(false);
    } catch {
      toast.error("Error assigning supervisor.");
    }
  };

  /* ✅ MATERIALS */
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
    } catch {
      toast.error("Error adding material.");
    }
  };


  const handleAssignMaterialsToTask = async (taskId, selectedMaterials) => {
    const currentUserId = localStorage.getItem("userId")?.trim().toLowerCase();
    console.log("🟢 Current logged-in user ID:", currentUserId);

    console.log("🟢 Supervisors for this project:", assignments.supervisors);

    const isSupervisor = assignments.supervisors.some(
      (s) => s.userId?.trim().toLowerCase() === currentUserId
    );
    console.log("🟢 Is current user a supervisor?", isSupervisor);

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
      console.log("🟢 Assign materials API response:", payload);

      if (!res.ok) {
        toast.error(payload.message ?? "Failed to assign materials.");
        return;
      }

      toast.success("Materials assigned to task.");
      fetchTasks(); // refresh tasks to show assigned materials
      setSelectedTaskMaterials(null); // close modal
    } catch (err) {
      console.error("❌ Error assigning materials:", err);
      toast.error("Error assigning materials to task.");
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
    } catch {
      toast.error("Error updating material.");
    }
  };

  /* ✅ UI helpers */
  const openAssignWorker = (task) => setAssignWorkerTask(task);
  const openWorkersModal = (task) => setSelectedTaskForWorkers(task);
  const openMaterialsModal = (task) => setSelectedTaskMaterials(task);
  const handleBack = () => navigate(-1);

  return (
    <div className="tt-dashboard">
      <Sidebar userId={userId} />

      <main className="tt-main">
        {/* ✅ Top Bar */}
        <div className="tt-topbar">
          <div className="tt-topbar-left">
            <button className="back-btn" onClick={handleBack}>
              <FiChevronLeft />
            </button>

            <div>
              <h1 className="tt-project-title">{project.name}</h1>
              <div className="tt-project-meta">
                <span className="tt-project-id">{project.code}</span>
                <span className={`tt-badge ${String(project.status).toLowerCase()}`}>
                  {project.status}
                </span>
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

        {/* ✅ Main Card */}
        <div className="tt-card">
          <div className="tt-card-top">
            <div className="tt-tabs">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`tt-tab ${activeTab === t ? "active" : ""}`}
                >
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
            {/* ✅ TASKS TABLE */}
            {(activeTab === "Tasks" || activeTab === "Summary") && (
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

                            <td
                              className="clickable"
                              onClick={() => openWorkersModal(task)}
                            >
                              {task.assignedWorkers.length === 0
                                ? "No workers"
                                : task.assignedWorkers.length <= 3
                                  ? task.assignedWorkers.join(", ")
                                  : `${task.assignedWorkers[0]}, ${task.assignedWorkers[1]} and ${task.assignedWorkers.length - 2
                                  } others`}
                            </td>

                            <td className="clickable" onClick={() => setTaskMaterialsView(task)}>                              {task.materials.length === 0
                              ? "No materials"
                              : task.materials.length <= 2
                                ? task.materials.map((m) => m.name).join(", ")
                                : `${task.materials[0].name}, ${task.materials[1].name} and ${task.materials.length - 2
                                } more`}
                            </td>

                            <td>{task.due}</td>

                            <td>
                              <span
                                className={`status-pill ${task.status === "Completed"
                                  ? "completed"
                                  : task.status === "InProgress"
                                    ? "inprogress"
                                    : "pending"
                                  }`}
                              >
                                {task.status}
                              </span>
                            </td>

                            <td>
                              <button className="tt-small-btn" onClick={() => openAssignWorker(task)}>
                                Assign Worker
                              </button>
                              <button
                                className="tt-small-btn outline"
                                onClick={() => setSelectedTaskMaterials(task)}
                              >
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

            {activeTab === "Work Logs" && (
              <div className="muted">Work logs coming soon.</div>
            )}

            {activeTab === "Materials" && (
              <div className="tt-materials-wrap">
                <h2>Project Materials</h2>

                {/* Loading state */}
                {loadingProject && project.materials.length === 0 ? (
                  <div className="muted">Loading materials...</div>
                ) : null}

                <ul>
                  {project.materials && project.materials.length > 0 ? (
                    project.materials.map((m) => (
                      <li key={m.id}>
                        {m.name} — <strong>{m.quantity ?? 0}</strong>
                      </li>
                    ))
                  ) : (
                    <li className="muted">No materials yet.</li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === "Attendance" && (
              <div className="muted">Attendance coming soon.</div>
            )}
          </div>
        </div>
      </main>


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
        <MaterialsModal
          onClose={() => setSelectedTaskMaterials(null)}
          materials={project.materials} // all project materials
          task={selectedTaskMaterials}   // the task we're assigning to
          onAssign={handleAssignMaterialsToTask} // handler for assigning
        />
      )}

      {showWorkerAssign && (
        <AssignWorkerToProjectModal
          onClose={() => setShowWorkerAssign(false)}
          onAssign={assignWorkerToProject}
          fetchAllWorkers={fetchAllWorkers}
          allWorkers={allWorkers}
        />
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
        <AssignSupervisorModal
          supervisors={supervisors}
          fetchSupervisors={fetchSupervisors}
          onClose={() => setShowSupervisorAssign(false)}
          onAssign={assignSupervisorToProject}
        />
      )}

      {selectedTaskForWorkers && (
        <ModalShell
          title={`Workers — ${selectedTaskForWorkers.name}`}
          onClose={() => setSelectedTaskForWorkers(null)}
        >
          <ul>
            {selectedTaskForWorkers.assignedWorkers.length === 0 ? (
              <li className="muted">No workers assigned</li>
            ) : (
              selectedTaskForWorkers.assignedWorkers.map((w, i) => (
                <li key={i}>{w}</li>
              ))
            )}
          </ul>

          <div className="pd-modal-actions">
            <button className="btn btn-outline" onClick={() => setSelectedTaskForWorkers(null)}>
              Close
            </button>
          </div>
        </ModalShell>
      )}

      {showProjectMaterialsModal && (
        <ProjectMaterialsModal
          onClose={() => setShowProjectMaterialsModal(false)}
          projectId={projectId}
          materials={project.materials}
          onAddMaterial={addProjectMaterial}
          onIncrease={increaseMaterial}
        />
      )}

      {taskMaterialsView && (
        <TaskMaterialsModal
          task={taskMaterialsView}
          project={project}         // ✅ Needed to show available quantities
          onClose={() => setTaskMaterialsView(null)}
        />
      )}
    </div>
  );

};

export default ProjectDashboard;
