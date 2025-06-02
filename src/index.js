import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // 确保 Tailwind / 全局样式都在这里被引入

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
