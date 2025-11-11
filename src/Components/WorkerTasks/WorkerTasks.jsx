// src/pages/WorkerTasks/WorkerTasksPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import WorkerLayout from "../WorkerLayout/WorkerLayout";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReturnMaterialsModal from "../ReturnMaterialsModal/ReturnMaterialsModal";
import "./WorkerTasks.css";

export default function WorkerTasksPage() {
  const { workerId: paramWorkerId } = useParams();
  const workerId = paramWorkerId || localStorage.getItem("userId");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projectsData, setProjectsData] = useState({});
  const [openReturnModal, setOpenReturnModal] = useState(false);
  const [modalContext, setModalContext] = useState({
    task: null,
    materials: [],
    supervisorId: null,
  });
  const [submittingTask, setSubmittingTask] = useState(false);

  const headers = {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  // ---------------------------------------------------------
  // ✅ Load Tasks
  // ---------------------------------------------------------
  useEffect(() => {
    if (!workerId || !token) return;
    loadAll();
  }, [workerId, token]);

  async function loadAll() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/worker/${workerId}/tasks`,
        { headers }
      );

      const data = await res.json();

      if (!res.ok || !data?.isSuccess) {
        toast.error(data?.message || "Error loading tasks");
        setLoading(false);
        return;
      }

      const workerTasks = data.data || [];
      setTasks(workerTasks);

      const projectIds = [
        ...new Set(workerTasks.map((t) => t.projectId).filter(Boolean)),
      ];
      const pd = {};

      for (const pid of projectIds) {
        try {
          // ✅ Load project supervisors
          const aRes = await fetch(
            `${API_BASE_URL}/api/v1/projects/${pid}/assignments`,
            { headers }
          );
          const aPayload = await aRes.json();

          const supervisorsRaw = aPayload?.data?.supervisors || [];
          const supervisors = supervisorsRaw.map((s) => ({
            supervisorId: s.supervisorId ?? s.SupervisorId,
            role: s.role ?? s.Role,
            fullName: s.fullName ?? s.FullName ?? "",
          }));

          // ✅ Find lead supervisor
          const lead = supervisors.find(
            (s) => String(s.role || "").toLowerCase() === "lead"
          );

          const leadSupervisorId = lead?.supervisorId || null;

          // ✅ Load project tasks
          const tRes = await fetch(
            `${API_BASE_URL}/api/v1/projects/${pid}/tasks`,
            { headers }
          );
          const tPayload = await tRes.json();
          const projTasks = tPayload?.data || [];

          const materialsByTask = {};
          const workersByTask = {};

          projTasks.forEach((pt) => {
            const taskId = pt.id ?? pt.Id;

            const rawMaterials = pt.materials ?? pt.Materials ?? [];
            const normalizedMaterials = rawMaterials.map((m) => ({
              id: m.materialId ?? m.MaterialId ?? m.id,
              name: m.name ?? m.Name ?? "",
              quantityAssigned: m.quantity ?? m.Quantity ?? 0,
              remaining: m.remaining ?? m.Remaining ?? m.quantity ?? 0,
              supervisorId: leadSupervisorId,
            }));

            materialsByTask[taskId] = normalizedMaterials;

            const rawWorkers = pt.assignedWorkers ?? pt.AssignedWorkers ?? [];
            workersByTask[taskId] = rawWorkers.map(
              (w) => w.fullName ?? w.FullName ?? w
            );
          });

          pd[pid] = {
            project: {
              id: pid,
              name:
                aPayload?.data?.projectName ||
                aPayload?.data?.ProjectName ||
                `Project ${pid}`,
            },
            supervisors,
            leadSupervisorId,
            materialsByTask,
            workersByTask,
          };
        } catch (err) {
          console.error(`Error loading project ${pid}:`, err);
        }
      }

      setProjectsData(pd);
    } catch (err) {
      toast.error("Network error loading tasks");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // ✅ Group tasks by project
  // ---------------------------------------------------------
  const tasksByProject = useMemo(() => {
    const groups = {};
    tasks.forEach((t) => {
      const pid = t.projectId ?? "unknown";
      if (!groups[pid]) groups[pid] = [];
      groups[pid].push(t);
    });
    return groups;
  }, [tasks]);

  // ---------------------------------------------------------
  // ✅ Open return modal
  // ---------------------------------------------------------
  const openReturn = (task, materials, supervisorId) => {
    setModalContext({ task, materials, supervisorId });
    setOpenReturnModal(true);
  };

  // ---------------------------------------------------------
  // ✅ Submit return handler
  // ---------------------------------------------------------
  const handleReturnSubmit = async (material, qtyToReturn) => {
    const pid = modalContext.task.projectId;
    const p = projectsData[pid];

    const supervisorId = p?.leadSupervisorId || null;

    const payload = {
      materialId: material.id,
      supervisorId,
      quantity: qtyToReturn,
      workerId,
      projectId: pid,
      taskId: modalContext.task.id,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/worker/return`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.message || "Return failed");
        return;
      }

      toast.success("Material returned successfully");
      setOpenReturnModal(false);
      loadAll();
    } catch (err) {
      toast.error("Network error returning material");
    }
  };

  // ---------------------------------------------------------
  // ✅ Finish Task
  // ---------------------------------------------------------
  const handleFinishTask = async (task) => {
    setSubmittingTask(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/worker/task/${task.id}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ workerId, submissionUrl: "" }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.message || "Failed to finish task");
        return;
      }

      toast.success("Task finished!");
      loadAll();
    } catch (err) {
      toast.error("Network error finishing task");
    } finally {
      setSubmittingTask(false);
    }
  };

  // ---------------------------------------------------------
  // ✅ Loading screen
  // ---------------------------------------------------------
  if (loading) {
    return (
      <WorkerLayout>
        <div className="wt-page">
          <div className="wt-loading">Loading tasks...</div>
        </div>
      </WorkerLayout>
    );
  }

  const renderNames = (arr) => {
    if (!arr?.length) return <span className="muted">None</span>;
    if (arr.length <= 2) return arr.join(", ");
    return `${arr.slice(0, 2).join(", ")} + ${arr.length - 2} more`;
  };

  // ---------------------------------------------------------
  // ✅ MAIN UI
  // ---------------------------------------------------------
  return (
    <WorkerLayout>
      <div className="wt-page">
        <header className="wt-header">
          <h2>My Tasks</h2>
          <p className="muted">Tasks assigned to you grouped by project</p>
        </header>

        {Object.keys(tasksByProject).length === 0 ? (
          <p className="muted">No tasks assigned.</p>
        ) : (
          Object.entries(tasksByProject).map(([projectId, list]) => {
            const p = projectsData[projectId] ?? {};

            return (
              <section key={projectId} className="wt-project-section">
                <h3 className="wt-project-title">{p.project?.name}</h3>

                {p.supervisors?.length > 0 && (
                  <p className="wt-supervisors">
                    Supervisors:{" "}
                    {renderNames(p.supervisors.map((s) => s.fullName))}
                  </p>
                )}

                <div className="wt-table-wrap">
                  <table className="wt-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Materials</th>
                        <th>Workers</th>
                        <th>Due</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {list.map((task) => {
                        const taskId = task.id;
                        const materials = p.materialsByTask?.[taskId] || [];
                        const workers = p.workersByTask?.[taskId] || [];

                        const deadline = task.deadLine
                          ? new Date(task.deadLine)
                          : null;

                        const status = (task.status ?? "Unknown").toString();
                        const statusClass = status
                          .toLowerCase()
                          .trim();

                        return (
                          <tr key={taskId}>
                            <td>
                              <strong>{task.name}</strong>
                              <div className="muted small">
                                {task.description}
                              </div>
                            </td>

                            <td>
                              {materials.length === 0
                                ? "None"
                                : materials.map((m) => (
                                    <div key={m.id}>
                                      {m.name} — {m.quantityAssigned} →{" "}
                                      {m.remaining}
                                    </div>
                                  ))}
                            </td>

                            <td>{renderNames(workers)}</td>

                            <td>
                              {deadline
                                ? deadline.toLocaleDateString()
                                : "—"}
                            </td>

                            <td>
                              <span className={`status-pill ${statusClass}`}>
                                {status}
                              </span>
                            </td>

                            <td className="wt-actions">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleFinishTask(task)}
                                disabled={submittingTask}
                              >
                                Finish Task
                              </button>

                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() =>
                                  openReturn(
                                    task,
                                    materials,
                                    p.leadSupervisorId
                                  )
                                }
                                disabled={!materials.length}
                              >
                                Return Materials
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })
        )}

        <ReturnMaterialsModal
          open={openReturnModal}
          onClose={() => setOpenReturnModal(false)}
          task={modalContext.task}
          materials={modalContext.materials}
          onSubmit={handleReturnSubmit}
        />
      </div>
    </WorkerLayout>
  );
}
