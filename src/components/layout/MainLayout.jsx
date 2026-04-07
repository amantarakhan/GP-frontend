import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import TutorialOverlay from "../tutorial/TutorialOverlay";
import CompareSpotlight from "../tutorial/CompareSpotlight";
import { TutorialProvider } from "../../context/TutorialContext";

export default function MainLayout() {
  const [expanded, setExpanded] = useState(false);

  return (
    <TutorialProvider>
      <div
        className="main-layout-wrapper"
        style={{
          display:    "flex",
          height:     "100vh",
          overflow:   "hidden",
          background: "var(--color-dash-bg)",
        }}
      >
        {/* Sidebar sits in the normal flex flow — it physically pushes content */}
        <Sidebar expanded={expanded} setExpanded={setExpanded} />

        {/* Content — naturally pushed by sidebar, no margin tricks needed */}
        <div
          className="main-content-wrapper"
          style={{
            flex:          1,
            display:       "flex",
            flexDirection: "column",
            overflow:      "hidden",
            minWidth:      0,
          }}
        >
          <TopBar />
          <TutorialOverlay />
          <CompareSpotlight />
          <main style={{
            flex:       1,
            overflowY:  "auto",
            overflowX:  "hidden",
            background: "var(--color-dash-bg)",
          }}>
            <Outlet />
          </main>
        </div>
      </div>
    </TutorialProvider>
  );
}