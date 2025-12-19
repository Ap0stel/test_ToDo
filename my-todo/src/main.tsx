import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <>
    <CssBaseline />
    <App />
  </>
);
