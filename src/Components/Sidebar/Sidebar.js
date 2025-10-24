import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBriefcase,
  FiUsers,
  FiUserCheck,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/MainDashboard", icon: <FiHome /> },
    { name: "Projects", path: "/projects", icon: <FiBriefcase /> },
    { name: "Workers", path: "/workers", icon: <FiUsers /> },
    { name: "Supervisors", path: "/supervisors", icon: <FiUserCheck /> },
    { name: "Materials", path: "/materials", icon: <FiBarChart2 /> },
    { name: "Settings", path: "/settings", icon: <FiSettings /> },
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
