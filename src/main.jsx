import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // 1. นำเข้า AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>  {/* 2. ครอบแอปไว้ด้วย Provider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);