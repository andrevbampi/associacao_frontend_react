import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { ParametrosProvider } from "./context/ParametrosContext";
import { ToastViewport } from "./components/common/ToastViewport";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ParametrosProvider>
            <App />
          </ParametrosProvider>
        </AuthProvider>
        <ToastViewport />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
