import React, { useEffect, useState } from 'react';
import { Card, Empty, Spin, message } from 'antd';
import { getProjectList, loadProject } from '../api/projects';
import { useProjectStore } from '../store/projectStore';

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

const MyProjects: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadProject: loadProjectToStore } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectList();
      setProjects(data);
    } catch (error) {
      console.error('加载项目列表失败:', error);
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '日期未知';
      }
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} 编辑过`;
    } catch (error) {
      console.error('日期格式化错误:', error, '原始值:', dateStr);
      return '日期错误';
    }
  };

  const handleOpenProject = async (projectId: string) => {
    // 直接在新标签页中打开，通过 URL 参数传递项目 ID
    window.open(`/canvas?projectId=${projectId}`, '_blank');
  };

  return (
    <div style={{ padding: '30px', background: '#fff', minHeight: '100%' }}>
      <div style={{
        marginBottom: '20px',
        color: '#000',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        我的设计
      </div>

      <div style={{
        marginBottom: '20px',
        color: '#666',
        fontSize: '14px'
      }}>
        共{projects.length}个
      </div>

      {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <Spin size="large" />
          </div>
        ) : projects.length === 0 ? (
          <Empty 
            description="暂无保存的项目"
            style={{ padding: '100px', color: '#666' }}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {projects.map((project) => (
              <Card
                key={project.id}
                hoverable
                onDoubleClick={() => handleOpenProject(project.id)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                bodyStyle={{ padding: 0 }}
                cover={
                  project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.name}
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'cover',
                        background: '#2a2a2a'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      无缩略图
                    </div>
                  )
                }
              >
                <div style={{ padding: '16px' }}>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: '#4CAF50',
                    color: '#000',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    画布
                  </div>
                  
                  <div style={{
                    color: '#fff',
                    fontSize: '14px',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {project.name}
                  </div>
                  
                  <div style={{
                    color: '#888',
                    fontSize: '12px'
                  }}>
                    {formatDate(project.updatedAt)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
};

export default MyProjects;
