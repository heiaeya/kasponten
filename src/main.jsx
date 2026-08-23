import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function showErrorOnScreen(message) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div style="background:#2a0e0e;color:#ffb3b3;padding:20px;font-family:monospace;
                white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.6;
                min-height:100vh;">
      <h2 style="color:#ff6b6b;margin-top:0;">⚠️ Error ketangkep:</h2>
      ${message}
    </div>
  `;
}

window.addEventListener("error", (e) => {
  showErrorOnScreen(`${e.message}\n\nFile: ${e.filename}:${e.lineno}:${e.colno}`);
});

window.addEventListener("unhandledrejection", (e) => {
  showErrorOnScreen(`Unhandled Promise Rejection:\n${e.reason}`);
});

try {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (err) {
  showErrorOnScreen(`${err.message}\n\n${err.stack || ""}`);
}
