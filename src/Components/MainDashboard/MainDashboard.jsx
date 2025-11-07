import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiBriefcase,
  FiCheckCircle,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import "./MainDashboard.css";

const MainDashboard = ({ supervisorName = "Supervisor" }) => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [projects, setProjects] = useState([]);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalSupervisors, setTotalSupervisors] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("last-month");

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId"); // ✅ used for routes

  useEffect(() => {
    if (!token) return;

    fetchProjects();
    fetchAnalytics(timeFilter);
  }, [timeFilter, token]);

  const fetchProjects = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/projects/my-projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!data.isSuccess) return;

    const projects = data.data;
    setProjects(projects);

    const workerSet = new Set();
    const supervisorSet = new Set();
    let taskCount = 0;
    let completedTaskCount = 0;

    for (let project of projects) {
      // Get project assignments
      const assignRes = await fetch(`${API_BASE_URL}/api/v1/projects/${project.id}/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const assignData = await assignRes.json();
      if (assignData.isSuccess) {
        // Add workers
        assignData.data.workers.forEach(w => workerSet.add(w.id));

        // Add supervisors if not lead
        assignData.data.supervisors
          .filter(s => !s.isLead) // exclude leads
          .forEach(s => supervisorSet.add(s.id));
      }

      // Get project tasks
      const statsRes = await fetch(`${API_BASE_URL}/api/v1/projects/${project.id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsData.isSuccess) {
        statsData.data.forEach(task => {
          taskCount++;
          if (task.status === "Completed") completedTaskCount++;
        });
      }
    }

    setTotalWorkers(workerSet.size);
    setTotalSupervisors(supervisorSet.size);
    setTotalTasks(taskCount);
    setCompletedTasks(completedTaskCount);

  } catch (err) {
    console.error("Error loading dashboard info:", err);
  }
};

  const fetchAnalytics = async (range) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/analytics?range=${range}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.isSuccess) {
        setAnalyticsData(data.data);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  };

  const incompleteTasks = totalTasks - completedTasks;

  return (
    <div className="tt-dashboard">
      <Sidebar userId={userId} />

      <main className="tt-main">
        <div className="dashboard-header">
          <h1>Welcome, {supervisorName} 👋</h1>
          <p className="muted">
            Here’s what’s happening with your projects today.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-cards">
          <div className="dash-card">
            <div className="card-icon workers">
              <FiUsers />
            </div>
            <div>
              <h2>{totalWorkers}</h2>
              <p>Total Workers</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="card-icon supervisors">
              <FiUsers />
            </div>
            <div>
              <h2>{totalSupervisors}</h2>
              <p>Total Supervisors</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="card-icon projects">
              <FiBriefcase />
            </div>
            <div>
              <h2>{projects.length}</h2>
              <p>Projects</p>
            </div>
          </div>

          <div className="dash-card">
            <div className="card-icon tasks">
              <FiCheckCircle />
            </div>
            <div>
              <h2>{totalTasks}</h2>
              <p>
                Tasks ({completedTasks} complete, {incompleteTasks} incomplete)
              </p>
            </div>
          </div>
        </div>

        <div className="filter-row">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="last-week">Last 7 Days</option>
            <option value="last-month">Last 30 Days</option>
            <option value="last-2-months">Last 2 Months</option>
          </select>
        </div>

        <div className="analytics-section">
          <h3>Project & Task Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="projects" stroke="#2563eb" />
              <Line type="monotone" dataKey="tasks" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>

          <div className="quick-grid">
            <div
              className="quick-card"
              onClick={() => navigate(`/projects/${userId}`)}
            >
              <FiBriefcase className="quick-icon" />
              <span>View Projects</span>
            </div>

            <div
              className="quick-card"
              onClick={() => navigate(`/workers/${userId}`)}
            >
              <FiUsers className="quick-icon" />
              <span>View Workers</span>
            </div>

            <div
              className="quick-card"
              onClick={() => navigate(`/supervisors/${userId}`)}
            >
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
