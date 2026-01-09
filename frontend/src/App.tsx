import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import CanvasPage from './pages/CanvasPage';
import ModelManagement from './pages/ModelManagement';
import './styles/global.css';

const App: React.FC = () => {
  // 根据 URL 路径决定显示哪个页面
  const currentPath = window.location.pathname;
  
  if (currentPath === '/canvas') {
    return <CanvasPage />;
  }
  
  if (currentPath === '/models') {
    return <ModelManagement />;
  }
  
  return <Home />;
};

export default App;
