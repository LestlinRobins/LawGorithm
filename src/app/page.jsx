"use client";
import { useState, useEffect } from "react";
import { Home } from "./frontend/components/Home";
import Info from "./frontend/components/Info";
import Search from "./frontend/components/Search";
import { Report } from "./frontend/components/Report";
import Defense from "./frontend/components/Defense";
import LeadPrediction from "./frontend/components/LeadPrediction";
import SettingsPage from "./frontend/components/SettingsPage";
import "./App.css";

// Client-side only component
function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isMounted, setIsMounted] = useState(false);
  const [deviceType, setDeviceType] = useState("Mobile");
  const [showSettings, setShowSettings] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  const handleSettingsClick = () => {
    setShowSettings(true);
  };
  const handleBackClick = () => {
    setShowSettings(false);
  };
  // Handle window-related operations only after component is mounted
  useEffect(() => {
    setIsMounted(true);

    // Set initial dimensions and device type
    const width = window.innerWidth;
    const height = window.innerHeight;
    setDimensions({ width, height });

    // Simple device type detection
    if (width <= 767) {
      setDeviceType("Mobile");
    } else if (width <= 1023) {
      setDeviceType("Tablet");
    } else if (width <= 1439) {
      setDeviceType("Desktop");
    } else {
      setDeviceType("Large Desktop");
    }

    // Add resize listener
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });

      // Update device type on resize
      if (width <= 767) {
        setDeviceType("Mobile");
      } else if (width <= 1023) {
        setDeviceType("Tablet");
      } else if (width <= 1439) {
        setDeviceType("Desktop");
      } else {
        setDeviceType("Large Desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case "home":
        return "Home";
      case "info":
        return "Information";
      case "search":
        return "Chat";
      case "report":
        return "Report";
      case "defense":
        return "Defense";
      default:
        return "Home";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "info":
        return <Info />;
      case "search":
        return <Search />;
      case "report":
        return <Report />;
      case "defense":
        return <Defense />;
      default:
        return <Home />;
    }
  };

  // Don't render anything until client-side hydration is complete
  if (!isMounted) {
    return <div className="loading">Loading...</div>;
  }

  const isMobile = dimensions.width <= 767;

  return (
    <>
      {showSettings ? (
        <div>
          <div
            className="back-button-container"
            style={{
              margin: "20px 0",
              backgroundColor: "transparent",
              position: "absolute",
              top: "5px",
              zIndex: 1000,
              left: "15px",
            }}
          >
            <button
              onClick={handleBackClick}
              className="back-button"
              style={{ display: "flex", alignItems: "center" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="24"
                height="24"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <SettingsPage handleBackClick={handleBackClick} />
        </div>
      ) : (
        <div className="app-container">
          <div className="red-bg"></div>

          <header className="app-header">
            <div className="header-content">
              <div className="user-section">
                <span className="user-name">LawGorithm</span>
                <div className="user-controls">
                  {!isMobile && (
                    <span className="device-type-indicator">{deviceType}</span>
                  )}
                  <button
                    onClick={handleSettingsClick}
                    className="settings-button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </button>
                  <div className="avatar">
                    <img src="/assets/im2.png" alt="User avatar" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="app-content">{renderContent()}</main>

          <footer className="tab-navigation">
            <button
              className={`tab-button ${activeTab === "home" ? "active" : ""}`}
              onClick={() => setActiveTab("home")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </button>
            <button
              className={`tab-button ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Info</span>
            </button>
            <button
              className={`tab-button ${activeTab === "search" ? "active" : ""}`}
              onClick={() => setActiveTab("search")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Chat</span>
            </button>
            <button
              className={`tab-button ${activeTab === "report" ? "active" : ""}`}
              onClick={() => setActiveTab("report")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <span>Report</span>
            </button>
            <button
              className={`tab-button ${
                activeTab === "defense" ? "active" : ""
              }`}
              onClick={() => setActiveTab("defense")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Defense</span>
            </button>
          </footer>
        </div>
      )}
    </>
  );
}

export default App;
