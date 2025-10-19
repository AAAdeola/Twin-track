import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);

    // ✅ Simulate successful login
    onLoginSuccess(); // This will navigate to Home
  };

  return (
    <div className="login-page">
      {/* Background overlay */}
      <div
        className="login-bg"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/Images/Twin-track-img-1.jpg)`,
        }}
      ></div>

      {/* Login form */}
      <div className="login-container shadow-lg p-4">
        <div className="text-center mb-4">
          <img
            src={`${process.env.PUBLIC_URL}/Images/Twin-track-logo.jpg`}
            alt="TwinTrack Logo"
            className="login-logo mb-2"
            style={{ maxWidth: "120px" }}
          />
          <h4 className="fw-bold">TwinTrack</h4>
          <p className="text-muted mb-4">Welcome to TwinTrack</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              name="emailOrPhone"
              placeholder="Email or Phone Number"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="text-end mb-3">
            <a href="#" className="text-decoration-none forgot-password">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
