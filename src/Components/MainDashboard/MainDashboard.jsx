import React, { useMemo } from "react";
import { FiUsers, FiBriefcase, FiCheckCircle, FiBarChart2 } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import "./MainDashboard.css";

const MainDashboard = ({ supervisorName = "Saeed Rido" }) => {
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      name: "Residential Complex",
      status: "Completed",
      workers: ["Ahmed", "Tola", "Zain", "Mary"],
    },
    {
      id: 2,
      name: "Office Tower",
      status: "In Progress",
      workers: ["Tola", "Lara", "Kemi", "James"],
    },
    {
      id: 3,
      name: "Shopping Plaza",
      status: "In Progress",
      workers: ["Ahmed", "Fatima", "Zain"],
    },
  ];

  const supervisors = [
    "Saeed Rido",
    "John Doe",
    "Fatima Ibrahim",
    "Usman Bello",
  ];

  const tasks = [
    { id: 1, status: "Completed" },
    { id: 2, status: "Completed" },
    { id: 3, status: "In Progress" },
    { id: 4, status: "Pending" },
  ];

  const uniqueWorkers = useMemo(() => {
    const all = new Set();
    projects.forEach((p) => p.workers.forEach((w) => all.add(w)));
    return Array.from(all);
  }, [projects]);

  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const incompleteProjects = totalProjects - completedProjects;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const incompleteTasks = totalTasks - completedTasks;

  const chartData = [
    { name: "Mon", Projects: 2, Tasks: 6 },
    { name: "Tue", Projects: 3, Tasks: 9 },
    { name: "Wed", Projects: 3, Tasks: 7 },
    { name: "Thu", Projects: 4, Tasks: 10 },
    { name: "Fri", Projects: 4, Tasks: 8 },
    { name: "Sat", Projects: 5, Tasks: 11 },
    { name: "Sun", Projects: 3, Tasks: 6 },
  ];

  return (
    <div className="tt-dashboard">
      <Sidebar />
      <main className="tt-main">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Welcome, {supervisorName} 👋</h1>
          <p className="muted">Here’s what’s happening with your projects today.</p>
        </div>

        <div className="dashboard-cards">
          <div className="dash-card">
            <div className="card-icon workers">
              <FiUsers />
            </div>
            <div>
              <h2>{uniqueWorkers.length}</h2>
              <p>Total Workers</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="card-icon supervisors">
              <FiUsers />
            </div>
            <div>
              <h2>{supervisors.length}</h2>
              <p>Total Supervisors</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="card-icon projects">
              <FiBriefcase />
            </div>
            <div>
              <h2>{totalProjects}</h2>
              <p>Projects ({completedProjects} complete, {incompleteProjects} incomplete)</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="card-icon tasks">
              <FiCheckCircle />
            </div>
            <div>
              <h2>{totalTasks}</h2>
              <p>Tasks ({completedTasks} complete, {incompleteTasks} incomplete)</p>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h3>Project & Task Overview</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Projects" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="Tasks" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="quick-grid">
            <div className="quick-card" onClick={() => navigate("/projects")}>
              <FiBriefcase className="quick-icon" />
              <span>View Projects</span>
            </div>
            <div className="quick-card" onClick={() => navigate("/workers")}>
              <FiUsers className="quick-icon" />
              <span>View Workers</span>
            </div>
            <div className="quick-card" onClick={() => navigate("/supervisors")}>
              <FiUsers className="quick-icon" />
              <span>View Supervisors</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;
