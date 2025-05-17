import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { RegionProvider } from "./contexts/RegionContext";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <RegionProvider>
      <App />
    </RegionProvider>
  </React.StrictMode>
);
