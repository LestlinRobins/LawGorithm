// components/Home.jsx
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChildSafety from "./ChildSafety";
import AnonymousReporting from "./AnonymousReporting";
import LeadPrediction from "./LeadPrediction";
import SettingsPage from "./SettingsPage";
import Heatmap from "./Heatmap";
import Image from "next/image";
import { Search, Loader, User, MapPin, PhoneCall, Target } from "react-feather";

export function Home() {
  const [showChildSafety, setShowChildSafety] = useState(false);
  const [showLeadPrediction, setShowLeadPrediction] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showAnonymousReporting, setShowAnonymousReporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const router = useRouter();

  // Handle window-related operations only after component is mounted
  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChildSafetyClick = () => {
    setShowChildSafety(true);
  };

  const handleLeadPredictionClick = () => {
    setShowLeadPrediction(true);
  };

  const handleHeatmapClick = () => {
    setShowHeatmap(true);
  };
  const handleSettingsClick = () => {
    setShowSettings(true);
  };
  const handleAnonymousReportingClick = () => {
    setShowAnonymousReporting(true);
  };
  const handleBackClick = () => {
    setShowChildSafety(false);
    setShowLeadPrediction(false);
    setShowHeatmap(false);
    setShowAnonymousReporting(false);
    setShowSettings(false);
  };

  const handleRedirect = (path) => {
    router.push(path);
  };

  // Don't render anything until client-side hydration is complete
  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      {showChildSafety ? (
        <div>
          <div className="back-button-container" style={{ margin: "20px 0" }}>
            <button
              onClick={handleBackClick}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                background: "#9b9b9b26",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
          <ChildSafety />
        </div>
      ) : showLeadPrediction ? (
        <div>
          <div className="back-button-container" style={{ margin: "20px 0" }}>
            <button
              onClick={handleBackClick}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                background: "#9b9b9b26",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
          <LeadPrediction />
        </div>
      ) : showHeatmap ? (
        <div>
          <div className="back-button-container" style={{ margin: "20px 0" }}>
            <button
              onClick={handleBackClick}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                background: "#9b9b9b26",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
          <Heatmap />
        </div>
      ) : showAnonymousReporting ? (
        <div>
          <div className="back-button-container" style={{ margin: "20px 0" }}>
            <button
              onClick={handleBackClick}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                background: "#9b9b9b26",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
          </div>
          <AnonymousReporting />
        </div>
      ) : (
        <>
          <div className="announcement-section">
            <div className="section-header">
              <img src="/assets/bell.png" />
              <h2>Announcements</h2>
            </div>
            <div
              className="announcement-card"
              style={{ overflow: "hidden", width: "100%" }}
            >
              <div
                style={{
                  backgroundColor: "#d1d1d12f",
                  width: "100%",
                  borderRadius: "10px",
                  padding: "clamp(12px, 4vw, 20px)",
                  display: "flex",
                  flexDirection: "column",
                  color: "white",
                  fontFamily: "Arial, sans-serif",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "clamp(8px, 3vw, 15px)",
                    flexDirection: windowWidth <= 400 ? "column" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "clamp(40px, 12vw, 60px)",
                      height: "clamp(40px, 12vw, 60px)",
                      marginTop: "5px",
                      alignSelf: windowWidth <= 400 ? "center" : "flex-start",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: "100%", height: "100%", fill: "#ff5151" }}
                    >
                      <path d="M12,2L4,5v6.09c0,5.05,3.41,9.76,8,10.91c4.59-1.15,8-5.86,8-10.91V5L12,2z M15,15.5h-6v-1.4c0-2,4-3.1,6-3.1V15.5z M12,9c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S10.9,9,12,9z" />
                    </svg>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      textAlign: windowWidth <= 400 ? "center" : "left",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "clamp(18px, 5vw, 24px)",
                        fontWeight: "bold",
                        margin: "0 0 clamp(6px, 2vw, 10px) 0",
                        color: "#ff5151",
                      }}
                    >
                      Aluva Cyber Police
                    </h3>
                    <p
                      style={{
                        fontSize: "clamp(14px, 3.5vw, 16px)",
                        lineHeight: "1.4",
                        margin: "0",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        hyphens: "auto",
                        maxWidth: "100%",
                        color: "#999999",
                      }}
                    >
                      Online Fraud scam investigation. Apprehend the thief and
                      earn an opportunity to receive a reward of 1 lakh!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="features-section">
            <div className="feature-list">
              <div
                className="feature-card"
                onClick={() => handleRedirect("/spam")}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <Search />
                </div>
                <div className="feature-details">
                  <h3>Scam Detection</h3>
                  <p>
                    Paste a message or link, and our AI will instantly detect
                    fraud, providing a scam probability score and insights to
                    protect you from phishing and financial fraud.
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={handleLeadPredictionClick}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <Loader />
                </div>
                <div className="feature-details">
                  <h3>Lead Prediction</h3>
                  <p>
                    Enter case details, and our AI will analyze patterns,
                    uncover hidden clues, and suggest leads to help
                    investigators move forward.
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={handleChildSafetyClick}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <User />
                </div>
                <div className="feature-details">
                  <h3>Child Safety</h3>
                  <p>
                    Smart sensors detect sudden movements and alert close
                    contacts to ensure quick response and safety in potential
                    danger.
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={handleHeatmapClick}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <MapPin />
                </div>
                <div className="feature-details">
                  <h3>Crime Heatmap</h3>
                  <p>
                    Maps crime trends using real-time reports and historical
                    data, keeping authorities and citizens informed and
                    proactive.
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={() => handleRedirect("/dispatch")}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <PhoneCall />
                </div>
                <div className="feature-details">
                  <h3>Emergency Dispatch</h3>
                  <p>
                    A rapid response system designed for emergency situations,
                    enabling swift alerts and assistance to ensure safety and
                    timely intervention.
                  </p>
                </div>
              </div>

              <div
                className="feature-card"
                onClick={handleAnonymousReportingClick}
                style={{ cursor: "pointer" }}
              >
                <div className="feature-icon">
                  <Target color="#ff5151" />
                </div>
                <div className="feature-details">
                  <h3>Anonymous Reporting</h3>
                  <p>
                    Report crimes seamlessly and completely without the need to
                    visit a police station in person.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
