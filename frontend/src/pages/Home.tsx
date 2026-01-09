import React, { useState } from 'react';
import { Button } from 'antd';
import { AppstoreOutlined, FolderOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import ExcellentCases from './ExcellentCases';
import MyProjects from './MyProjects';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'myProjects'>('cases');

  const handleOpenCanvas = () => {
    // 在新标签页中打开画布
    window.open('/canvas', '_blank');
  };

  const handleOpenModelManagement = () => {
    // 打开模型管理页面
    window.open('/models', '_blank');
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 顶部导航栏 */}
      <div style={{
        height: '70px',
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 30px',
        justifyContent: 'space-between'
      }}>
        <div style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold' }}>
          AI设计工作台
        </div>
      </div>

      {/* 侧边导航栏 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: '200px',
          background: '#fff',
          borderRight: '1px solid #e0e0e0',
          padding: '20px 0',
        }}>
          <div
            onClick={() => setActiveTab('cases')}
            style={{
              padding: '15px 30px',
              color: activeTab === 'cases' ? '#4CAF50' : '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: activeTab === 'cases' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              borderLeft: activeTab === 'cases' ? '3px solid #4CAF50' : '3px solid transparent',
            }}
          >
            <AppstoreOutlined style={{ fontSize: '18px' }} />
            <span>优秀案例</span>
          </div>

          <div
            onClick={() => setActiveTab('myProjects')}
            style={{
              padding: '15px 30px',
              color: activeTab === 'myProjects' ? '#4CAF50' : '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: activeTab === 'myProjects' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
              borderLeft: activeTab === 'myProjects' ? '3px solid #4CAF50' : '3px solid transparent',
            }}
          >
            <FolderOutlined style={{ fontSize: '18px' }} />
            <span>我的设计</span>
          </div>

          <div
            onClick={handleOpenModelManagement}
            style={{
              padding: '15px 30px',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '10px',
              borderTop: '1px solid #e0e0e0',
              paddingTop: '25px',
            }}
          >
            <SettingOutlined style={{ fontSize: '18px' }} />
            <span>模型管理</span>
          </div>

          <div
            onClick={handleOpenCanvas}
            style={{
              padding: '15px 30px',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '10px',
            }}
          >
            <EditOutlined style={{ fontSize: '18px' }} />
            <span>无限画布</span>
          </div>
        </div>

        {/* 内容区域 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'cases' && <ExcellentCases />}
          {activeTab === 'myProjects' && <MyProjects onBack={() => {}} />}
        </div>
      </div>
    </div>
  );
};

export default Home;
