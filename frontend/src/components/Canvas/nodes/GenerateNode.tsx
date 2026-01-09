import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Progress, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { GenerateNodeData, ResultImage } from '../../../types';
import { useProjectStore } from '../../../store/projectStore';

const GenerateNode: React.FC<NodeProps<GenerateNodeData>> = ({ data }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toggleImageSelection, selectedImageIds } = useProjectStore();
  
  const handleCopyPrompt = (index: number) => {
    navigator.clipboard.writeText(data.prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  const handleImageDoubleClick = (imageId: string) => {
    toggleImageSelection(imageId);
  };
  
  return (
    <div style={{
      background: 'rgba(26, 26, 26, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      minWidth: '280px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    }}>
      <Handle type="target" position={Position.Left} />
      
      <div style={{ marginBottom: '10px', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
        {data.modelName}
      </div>
      
      <div style={{ marginBottom: '10px', color: '#ccc', fontSize: '12px' }}>
        {data.prompt}
      </div>
      
      {data.status === 'running' && (
        <Progress percent={data.progress} size="small" />
      )}
      
      {data.status === 'success' && data.resultImages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.resultImages.map((img: ResultImage, index: number) => {
            const isSelectedForGeneration = selectedImageIds.includes(img.imageId);
            
            return (
              <div key={img.imageId} style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                border: isSelectedForGeneration ? '2px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                boxShadow: isSelectedForGeneration ? '0 0 15px rgba(76, 175, 80, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}>
                {/* 选中序号徽章 */}
                {isSelectedForGeneration && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    background: '#4CAF50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0a0a0a',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#000',
                    zIndex: 10,
                  }}>
                    {selectedImageIds.indexOf(img.imageId) + 1}
                  </div>
                )}
                
                {/* 图片序号标题 */}
                {data.resultImages.length > 1 && (
                  <div style={{ 
                    color: '#4CAF50', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{
                      background: '#4CAF50',
                      color: '#000',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      图{index + 1}
                    </span>
                  </div>
                )}
                
                {/* 生成的图片 */}
                <img 
                  src={img.url} 
                  alt={`generated-${index + 1}`}
                  onDoubleClick={() => handleImageDoubleClick(img.imageId)}
                  style={{ 
                    width: '100%', 
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                
                {/* 已选中标记 */}
                {isSelectedForGeneration && (
                  <div style={{
                    marginBottom: '8px',
                    color: '#4CAF50',
                    fontSize: '10px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    已选中
                  </div>
                )}
                
                {/* 提示词 */}
                <div style={{
                  color: '#999',
                  fontSize: '11px',
                  lineHeight: '1.5',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                  borderLeft: '2px solid #4CAF50',
                  position: 'relative'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <div style={{ color: '#666', fontSize: '10px' }}>提示词</div>
                    <Tooltip title={copiedIndex === index ? '已复制' : '复制提示词'}>
                      <div
                        onClick={() => handleCopyPrompt(index)}
                        style={{
                          cursor: 'pointer',
                          color: copiedIndex === index ? '#4CAF50' : '#666',
                          fontSize: '12px',
                          padding: '2px 4px',
                          borderRadius: '3px',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => {
                          if (copiedIndex !== index) {
                            e.currentTarget.style.color = '#999';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (copiedIndex !== index) {
                            e.currentTarget.style.color = '#666';
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {copiedIndex === index ? <CheckOutlined /> : <CopyOutlined />}
                      </div>
                    </Tooltip>
                  </div>
                  <div style={{ wordBreak: 'break-word' }}>
                    {data.prompt}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {data.status === 'failed' && (
        <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
          生成失败：{data.error}
        </div>
      )}
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default GenerateNode;
