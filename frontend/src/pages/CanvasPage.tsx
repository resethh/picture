import React, { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { message } from 'antd';
import Canvas from '../components/Canvas/Canvas';
import TopBar from '../components/TopBar/TopBar';
import BottomPanel from '../components/BottomPanel/BottomPanel';
import RightToolbar from '../components/RightToolbar/RightToolbar';
import { useProjectStore } from '../store/projectStore';
import { loadProject } from '../api/projects';
import '../styles/global.css';

const CanvasPage: React.FC = () => {
  const { loadProject: loadProjectToStore } = useProjectStore();

  useEffect(() => {
    // 从 URL 获取项目 ID
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    
    if (projectId) {
      // 加载项目数据
      loadProject(projectId)
        .then(projectData => {
          loadProjectToStore(projectData);
          console.log('项目加载成功:', projectData);
        })
        .catch(error => {
          console.error('加载项目失败:', error);
          message.error('加载项目失败');
        });
    }
  }, []);
  const handleBackToHome = () => {
    // 关闭当前标签页
    window.close();
    // 如果无法关闭（浏览器安全限制），则跳转到首页
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar onBackToHome={handleBackToHome} />
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlowProvider>
          <Canvas />
          <RightToolbar />
        </ReactFlowProvider>
        <BottomPanel />
      </div>
    </div>
  );
};

export default CanvasPage;
