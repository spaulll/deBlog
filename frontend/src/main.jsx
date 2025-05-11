import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThirdwebProvider } from "thirdweb/react";
import ToastWrapper from "./components/ToastWrapper";

ReactDOM.createRoot(document.getElementById("root")).render(
  //<React.StrictMode>
  <ThirdwebProvider>
    <AuthProvider>
      <BrowserRouter>
        <>
          <App />
          <ToastWrapper />
        </>
      </BrowserRouter>
    </AuthProvider>
  </ThirdwebProvider>
  //</React.StrictMode>
);
