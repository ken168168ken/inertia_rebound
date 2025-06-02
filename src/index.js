// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';                      // 引入 Tailwind 及自定義 CSS
import QueryMainPage from './components/QueryMainPage';

// React 18+ 的寫法
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 這裡先給 username="KenLee"，之後可接登入系統動態替換 */}
    <QueryMainPage username="KenLee" />
  </React.StrictMode>
);
