import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ImageNodeData } from '../../../types';
import { useProjectStore } from '../../../store/projectStore';

const ImageNode: React.FC<NodeProps<ImageNodeData>> = ({ data, selected }) => {
  const { toggleImageSelection, selectedImageIds } = useProjectStore();
  const isSelectedForGeneration = selectedImageIds.includes(data.imageId);
  
  const handleClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发画布的双击上传
    e.stopPropagation();
    toggleImageSelection(data.imageId);
  };
  
  return (
    <div 
      onClick={handleClick}
      style={{
        background: 'rgba(26, 26, 26, 0.9)',
        border: isSelectedForGeneration ? '2px solid #4CAF50' : (selected ? '2px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.1)'),
        borderRadius: '12px',
        padding: '12px',
        width: '200px',
        boxShadow: isSelectedForGeneration ? '0 0 20px rgba(76, 175, 80, 0.5)' : (selected ? '0 0 20px rgba(76, 175, 80, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.3)'),
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
      }}>
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
          {selectedImageIds.indexOf(data.imageId) + 1}
        </div>
      )}
      <div style={{ marginBottom: '8px', color: '#fff', fontSize: '12px' }}>
        图片
      </div>
      <img 
        src={data.url} 
        alt="uploaded" 
        style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
      />
      <div style={{ marginTop: '8px', color: '#888', fontSize: '12px' }}>
        {data.width} × {data.height}
      </div>
      {isSelectedForGeneration && (
        <div style={{ 
          marginTop: '6px', 
          color: '#4CAF50', 
          fontSize: '10px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          已选中
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default ImageNode;
