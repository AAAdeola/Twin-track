import React, { useEffect, useState } from "react";
import Landing from "./Components/Landing/Landing";
import Login from "./Components/Login/Login";
import Home from "./Components/Home/Home";
import About from "./Components/About/About";
import Services from"./Components/Services/Services";
import ServicesSection from"./Components/Achivement/ServicesSection";
import Portfolio from "./Components/Portfolio/Portfolio";
// import QuotePage from "./Components/QuoteSection/QuotePage";

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

  // Function to call when login is successful
  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowHome(true);
  };

  return (
    <>
      {showLanding && <Landing />}
      {showLogin && <Login onLoginSuccess={handleLoginSuccess} />}
      {showHome && (
        <>
          <Home />
          <About />
          <Services/>
          <ServicesSection/>
          <Portfolio/>
          {/* <QuotePage/> */}
        </>
      )}
    </>
  );
}

export default App;
