// src/App.js
import React from "react";
import QueryMainPage from "./components/QueryMainPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 直接把 QueryMainPage 当作主页 */}
      <QueryMainPage />
    </div>
  );
}

export default App;
