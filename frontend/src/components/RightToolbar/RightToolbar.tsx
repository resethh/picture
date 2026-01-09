import React from 'react';
import { 
  DragOutlined, 
  BorderOutlined, 
  PlusOutlined, 
  MinusOutlined,
  FullscreenOutlined,
  EyeOutlined 
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useReactFlow } from 'reactflow';

const RightToolbar: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  
  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '10px',
  };
  
  const buttonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '4px',
  };
  
  return (
    <div style={toolbarStyle}>
      <Tooltip title="平移模式" placement="left">
        <Button 
          icon={<DragOutlined />} 
          style={buttonStyle}
        />
      </Tooltip>
      
      <Tooltip title="框选模式" placement="left">
        <Button 
          icon={<BorderOutlined />} 
          style={buttonStyle}
        />
      </Tooltip>
      
      <Tooltip title="放大" placement="left">
        <Button 
          icon={<PlusOutlined />} 
          style={buttonStyle}
          onClick={() => zoomIn()}
        />
      </Tooltip>
      
      <Tooltip title="缩小" placement="left">
        <Button 
          icon={<MinusOutlined />} 
          style={buttonStyle}
          onClick={() => zoomOut()}
        />
      </Tooltip>
      
      <Tooltip title="自适应视图" placement="left">
        <Button 
          icon={<FullscreenOutlined />} 
          style={buttonStyle}
          onClick={() => fitView()}
        />
      </Tooltip>
      
      <Tooltip title="切换视图" placement="left">
        <Button 
          icon={<EyeOutlined />} 
          style={buttonStyle}
        />
      </Tooltip>
    </div>
  );
};

export default RightToolbar;
