import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Components/Landing/Landing";
import Login from "./Components/Login/Login";
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

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showHome, setShowHome] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowLanding(false);
      setShowLogin(true);
    }, 5000);
    return () => clearTimeout(timer1);
  }, []);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowHome(true);
  };

  return (
    <Router>
      {/* Always render router shell */}
      {showLanding && <Landing />}

      {showLogin && <Login onLoginSuccess={handleLoginSuccess} />}

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
        </Routes>
      )}
      
    </Router>
  );
}

export default App;
