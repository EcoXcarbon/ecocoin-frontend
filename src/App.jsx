// src/App.jsx
import React, { useState } from "react";
import Faucet from "./components/Faucet";
import Staking from "./components/Staking";
import AssetSubmission from "./components/AssetSubmission";
import CarbonRegistry from "./components/CarbonRegistry";
import favicon from "./assets/eco-favicon.png";

function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [score, setScore] = useState(78);
  const [rank, setRank] = useState(12);

  const EcoScoreHeader = () => (
    activeTab === "quiz" && (
      <div style={{
        marginBottom: 20,
        padding: "10px 20px",
        background: "#f0f9f3",
        border: "1px solid #cfe9dc",
        borderRadius: 8
      }}>
        <h3 style={{ margin: 0, color: "#2f5d3f" }}>
          🌿 Your Eco Impact Score: <span style={{ color: "#1d4d2e" }}>{score}</span>
        </h3>
        <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>
          You’re ranked <strong>#{rank}</strong> among quiz users. Final reward to be calculated after 60 days.
        </p>
      </div>
    )
  );

  return (
    <div style={{
      fontFamily: "sans-serif",
      minHeight: "100vh",
      backgroundColor: "#f6f9f6",
      padding: 24
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24
      }}>
        <img src={favicon} alt="EcoCoin Logo" style={{ height: 36, marginRight: 12 }} />
        <h1 style={{ margin: 0, fontSize: 28, color: "#2f5d3f" }}>EcoCoin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 12,
        marginBottom: 32
      }}>
        {[
          { key: "quiz", label: "Quiz" },
          { key: "staking", label: "Staking" },
          { key: "submit", label: "Submit Data" },
          { key: "registry", label: "Carbon Registry" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: activeTab === tab.key ? "2px solid #2f5d3f" : "1px solid #ccc",
              backgroundColor: activeTab === tab.key ? "#e6f4ea" : "#fff",
              color: "#2f5d3f",
              fontWeight: activeTab === tab.key ? "bold" : "normal",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              boxShadow: activeTab === tab.key ? "0 0 4px rgba(0,0,0,0.1)" : "none"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab && (
        <div style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "24px 32px",
          backgroundColor: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 0 12px rgba(0,0,0,0.05)",
          textAlign: "left"
        }}>
          <EcoScoreHeader />
          {activeTab === "quiz" && <Faucet setScore={setScore} setRank={setRank} />}
          {activeTab === "staking" && <Staking />}
          {activeTab === "submit" && <AssetSubmission />}
          {activeTab === "registry" && <CarbonRegistry isAdmin={true} />}
        </div>
      )}
    </div>
  );
}

export default App;
