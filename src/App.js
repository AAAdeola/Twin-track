import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import About from "./Components/About/About";
import Services from "./Components/Services/Services";
import ServicesSection from "./Components/Achivement/ServicesSection";
import Portfolio from "./Components/Portfolio/Portfolio";
import QuotePage from "./Components/QuoteSection/QuotePage";
import Footer from "./Components/Footer/Footer";
import Dashboard from "./Components/MainDashboard/MainDashboard";
import ProjectsList from "./Components/Projects/ProjectsList";
import ProjectDashboard from "./Components/ProjectDashboard/ProjectDashboard";
import WorkersList from "./Components/WorkersList/WorkersList";
import SupervisorsList from "./Components/SupervisorsList/SupervisorsList";
import Login from "./Components/Login/Login";
import Landing from "./Components/Landing/Landing";

function App() {
  const [showLanding] = useState(false);
  const [showLogin] = useState(false);
  const [showHome] = useState(true);

  return (
    <Router>
      {showHome && (
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Home />
                <About />
                <Services />
                <ServicesSection />
                <Portfolio />
                <QuotePage />
                <Footer />
              </>
            }
          />

          <Route path="/MainDashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/project/:id" element={<ProjectDashboard />} />
          <Route path="/workers" element={<WorkersList />} />
          <Route path="/supervisors" element={<SupervisorsList />} />

          <Route path="/Login" element={<Login />} />

          <Route path="/Landing" element={<Landing />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
