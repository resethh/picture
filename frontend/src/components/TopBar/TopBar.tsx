import React from 'react';
import { Button, message, Modal } from 'antd';
import { HomeOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useProjectStore } from '../../store/projectStore';
import { saveProject, shareProject } from '../../api/projects';

const TopBar: React.FC<{ onBackToHome?: () => void }> = ({ onBackToHome }) => {
  const { projectId, projectName, setProjectId, setProjectName, nodes, edges } = useProjectStore();
  
  const handleSave = async () => {
    // 检查项目名称
    if (!projectName || projectName === '未命名' || projectName.trim() === '') {
      Modal.confirm({
        title: '请命名项目',
        content: '请先给项目起个名字再保存',
        okText: '好的',
        cancelText: '取消',
        centered: true,
      });
      return;
    }
    
    try {
      const projectData = {
        id: projectId || undefined, // 如果有 ID 就传递，用于更新
        name: projectName,
        graph: {
          nodes,
          edges
        }
      };
      
      const result = await saveProject(projectData);
      
      // 如果是新项目，记录 ID
      if (!projectId && result.projectId) {
        setProjectId(result.projectId);
      }
      
      message.success(`项目「${projectName}」保存成功！`);
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    }
  };
  
  const handleShare = async () => {
    // 先检查是否有项目 ID
    if (!projectId) {
      message.warning('请先保存项目再分享');
      return;
    }
    
    Modal.confirm({
      title: '分享项目',
      content: '分享后将复制一份项目到公共空间，其他用户可以在优秀案例中查看。是否继续？',
      okText: '确认分享',
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        try {
          await shareProject(projectId);
          message.success('分享成功！项目已复制到公共空间');
        } catch (error) {
          console.error('分享失败:', error);
          message.error('分享失败，请重试');
        }
      }
    });
  };
  
  return (
    <div style={{
      height: '70px',
      background: '#000',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
    }}>
      <div style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold' }}>
        AI设计工作台
      </div>
      
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '14px',
          textAlign: 'center',
          outline: 'none',
        }}
      />
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {onBackToHome && (
          <Button 
            icon={<HomeOutlined />}
            onClick={onBackToHome}
            style={{ background: 'transparent', color: '#fff', border: '1px solid #333' }}
          >
            返回首页
          </Button>
        )}
        <Button 
          type="default" 
          icon={<ShareAltOutlined />}
          onClick={handleShare}
          style={{ background: 'transparent', color: '#fff', border: '1px solid #333' }}
        >
          分享
        </Button>
        <Button 
          type="primary" 
          onClick={handleSave}
          style={{ background: '#4CAF50', border: 'none' }}
        >
          保存
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
