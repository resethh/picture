import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ImageNode from './nodes/ImageNode';
import GenerateNode from './nodes/GenerateNode';
import { useProjectStore } from '../../store/projectStore';
import { uploadImage } from '../../api/images';
import { message } from 'antd';

const nodeTypes = {
  imageNode: ImageNode,
  generateNode: GenerateNode,
};

const Canvas: React.FC = () => {
  const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges, addNode } = useProjectStore();
  const syncLockRef = useRef(false);
  const doubleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [nodes, setNodesState, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
  
  // 从 store 同步到 ReactFlow（防止循环）
  useEffect(() => {
    if (!syncLockRef.current) {
      setNodesState(storeNodes);
    }
  }, [storeNodes]);
  
  useEffect(() => {
    if (!syncLockRef.current) {
      setEdgesState(storeEdges);
    }
  }, [storeEdges]);
  
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      syncLockRef.current = true;
      setEdgesState(newEdges);
      setEdges(newEdges);
      setTimeout(() => { syncLockRef.current = false; }, 50);
    },
    [edges, setEdgesState, setEdges]
  );
  
  // 处理节点变化
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );
  
  // 处理边变化
  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );
  
  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const baseTimestamp = Date.now();
    setIsUploading(true);
    
    try {
      // 批量上传所有选中的图片
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const result = await uploadImage(file);
        return { result, index };
      });
      
      const results = await Promise.all(uploadPromises);
      
      // 批量添加节点
      results.forEach(({ result, index }) => {
        const nodeId = `node_${baseTimestamp}_${index}`;
        addNode({
          id: nodeId,
          type: 'imageNode',
          position: { 
            x: Math.random() * 400 + 100, 
            y: Math.random() * 300 + 100 
          },
          data: result,
          selected: false,
        });
      });
      
      message.success(`成功上传 ${results.length} 张图片`);
    } catch (error) {
      console.error('上传失败:', error);
      message.error('部分图片上传失败，请重试');
    } finally {
      setIsUploading(false);
      // 重置input值，允许重复上传相同文件
      e.target.value = '';
    }
  };
  
  // 处理画布双击事件
  const handleCanvasDoubleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  return (
    <div 
      style={{ width: '100%', height: '100%' }}
      onDoubleClick={handleCanvasDoubleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: '#0a0a0a', opacity: isUploading ? 0.6 : 1 }}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={24} 
          size={1.5} 
          color="rgba(255, 255, 255, 0.15)" 
        />
        <Controls style={{ display: 'none' }} />
      </ReactFlow>
    </div>
  );
};

export default Canvas;
