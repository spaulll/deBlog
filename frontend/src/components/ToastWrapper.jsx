// ToastWrapper.jsx
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastWrapper = () => (
    <ToastContainer
    position="bottom-right"
    autoClose={3000}
    hideProgressBar={false}
    closeOnClick
    pauseOnFocusLoss
    draggable
    pauseOnHover
    toastStyle={{
      backgroundColor: "#f8f9fa",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.05)",
      borderRadius: "6px",
      fontSize: "14px",
      border: "1px solid #e9ecef",
      color: "#495057",
      padding: "10px 16px",
      margin: "8px 0",
    }}
    style={{
      zIndex: 9999,
      width: "320px",
    }}
  />
);

export default ToastWrapper;
