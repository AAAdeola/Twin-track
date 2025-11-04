import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBriefcase,
  FiUsers,
  FiUserCheck,
  FiSettings,
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId");

  const menuItems = [
    { name: "Dashboard", path: `/MainDashboard/${userId}`, icon: <FiHome /> },
    { name: "Projects", path: `/projects/${userId}`, icon: <FiBriefcase /> },
    { name: "Workers", path: `/workers/${userId}`, icon: <FiUsers /> },
    { name: "Supervisors", path: `/supervisors/${userId}`, icon: <FiUserCheck /> },
    { name: "Settings", path: `/settings/${userId}`, icon: <FiSettings /> },
    { name: "Assigned Projects", path: `/assigned-projects/${userId}`, icon: <FiBriefcase /> }
  ];

  return (
    <aside className="tt-sidebar">
      <div className="tt-logo">TwinTrack</div>

      <ul className="tt-menu">
        {menuItems.map((item) => (
          <li
            key={item.path}
            className={`tt-menu-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
