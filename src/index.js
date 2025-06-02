import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';    // 一定要把 Tailwind 的 CSS import 進來
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
