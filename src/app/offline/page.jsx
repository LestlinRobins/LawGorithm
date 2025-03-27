"use client";

import React from "react";
import "../../app/App.css";

export default function Offline() {
  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-content">
          <div className="user-section">
            <span className="user-name">LawGorithm</span>
          </div>
        </div>
      </div>

      <main className="app-content">
        <div className="offline-container">
          <div className="offline-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="64"
              height="64"
              fill="none"
              stroke="#ff3b30"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 1l22 22M16.72 16.72A10.94 10.94 0 0112 18c-2.9 0-5.5-1.12-7.42-2.94" />
              <path d="M8.53 8.53c-.94 1.07-1.53 2.48-1.53 4.02 0 1.2.36 2.32.97 3.25M12 2a10 10 0 0110 10M19.07 4.93a10 10 0 00-3.03-1.88" />
              <path d="M4.93 4.93a10 10 0 00-2.83 8.23" />
            </svg>
          </div>
          <h1>You are offline</h1>
          <p>Please check your internet connection and try again.</p>
          <p className="cached-message">
            Don't worry, you can still access previously loaded content.
          </p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>

      <style jsx>{`
        .offline-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          height: 70vh;
        }

        .offline-icon {
          margin-bottom: 1.5rem;
          animation: pulse 2s infinite;
        }

        h1 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #ff3b30;
        }

        p {
          margin-bottom: 1rem;
          color: #a0a0a0;
          max-width: 300px;
        }

        .cached-message {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .retry-button {
          background-color: #ff3b30;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          margin-top: 1.5rem;
          cursor: pointer;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
