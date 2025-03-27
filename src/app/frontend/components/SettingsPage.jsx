import React, { useState } from "react";
import "./SettingsPage.css";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("Account");

  const tabs = [
    "Account",
    "Privacy",
    "Notifications",
    "Personalization",
    "About",
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Account":
        return (
          <div className="settings-tab-content">
            <div className="settings-option">
              <h3>Email and Password</h3>
              <p>
                Modify your account credentials and enhance your security
                settings.
              </p>
            </div>
            <div className="settings-option">
              <h3>Profile</h3>
              <p>
                Update your profile information and manage personal details.
              </p>
            </div>
            <div className="settings-option">
              <h3>Account Verification</h3>
              <p>
                Verify your identity and secure your account with additional
                measures.
              </p>
            </div>
          </div>
        );
      case "Privacy":
        return (
          <div className="settings-tab-content">
            <div className="settings-option">
              <h3>Privacy Controls</h3>
              <p>
                Manage who can see your activity and control your data
                visibility.
              </p>
            </div>
            <div className="settings-option">
              <h3>Data Usage</h3>
              <p>
                Control how your data is used for personalization and other
                services.
              </p>
            </div>
          </div>
        );
      case "Notifications":
        return (
          <div className="settings-tab-content">
            <div className="settings-option">
              <h3>Alert Preferences</h3>
              <p>
                Customize which notifications you receive and how they are
                delivered.
              </p>
            </div>
            <div className="settings-option">
              <h3>Emergency Alerts</h3>
              <p>
                Configure settings for critical emergency notifications in your
                area.
              </p>
            </div>
          </div>
        );
      case "Personalization":
        return (
          <div className="settings-tab-content">
            <div className="settings-option">
              <h3>Theme</h3>
              <p>
                Customize the app's appearance and visual theme preferences.
              </p>
            </div>
            <div className="settings-option">
              <h3>Language</h3>
              <p>Change language settings and regional preferences.</p>
            </div>
            <div className="settings-option">
              <h3>Accessibility</h3>
              <p>
                Adjust features to improve app accessibility based on your
                needs.
              </p>
            </div>
          </div>
        );
      case "About":
        return (
          <div className="settings-tab-content">
            <div className="settings-option">
              <h3>App Information</h3>
              <p>
                View details about the app version and development information.
              </p>
            </div>
            <div className="settings-option">
              <h3>Legal</h3>
              <p>
                Access terms of service, privacy policy, and legal
                documentation.
              </p>
            </div>
            <div className="settings-option">
              <h3>Support</h3>
              <p>Get help, report issues, or contact customer support.</p>
            </div>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      <div className="profile-section">
        <div className="profile-image">
          {/* Profile image will be styled to show a placeholder */}
        </div>
      </div>

      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <div
          className="tab-indicator"
          style={{
            left: `${(tabs.indexOf(activeTab) / tabs.length) * 100}%`,
            width: `${100 / tabs.length}%`,
          }}
        ></div>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default SettingsPage;
