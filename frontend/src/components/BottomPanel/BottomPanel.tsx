import React, { useRef, useEffect, useState } from 'react';
import { Button, Input, Select, Spin, Tooltip } from 'antd';
import { PlusOutlined, SendOutlined, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useGenerationStore } from '../../store/generationStore';
import { useProjectStore } from '../../store/projectStore';
import { uploadImage } from '../../api/images';
import { createGenerateTask, getTaskStatus } from '../../api/generate';
import { getModelDetail } from '../../api/models';

const { TextArea } = Input;
const { Option } = Select;

const BottomPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modelDetail, setModelDetail] = useState<any>(null);
  const [showModelInfo, setShowModelInfo] = useState(false);
  
  const { 
    currentPrompt, 
    currentModel, 
    currentParams, 
    setPrompt, 
    setModel, 
    setParams,
    models,
    modelsLoading,
    loadModels 
  } = useGenerationStore();
  const { addNode, updateNode, nodes, selectedImageIds, toggleImageSelection, addEdge, updateEdge, edges } = useProjectStore();
  
  // Load models on component mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);
  
  // Load model detail when current model changes
  useEffect(() => {
    if (currentModel && models.length > 0) {
      const model = models.find(m => m.modelId === currentModel);
      if (model) {
        getModelDetail(model.id)
          .then(detail => setModelDetail(detail))
          .catch(err => console.error('Failed to load model detail:', err));
      }
    }
  }, [currentModel, models]);

  // ... rest of the existing methods ...
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const baseTimestamp = Date.now();
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const result = await uploadImage(file);
        return { result, index };
      });
      
      const results = await Promise.all(uploadPromises);
      
      results.forEach(({ result, index }) => {
        const nodeId = `node_${baseTimestamp}_${index}`;
        addNode({
          id: nodeId,
          type: 'imageNode',
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
          data: result,
          selected: false,
        });
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Some images failed to upload, please retry');
    }
    
    e.target.value = '';
  };
  
  const handleRemoveSelection = (imageId: string) => {
    toggleImageSelection(imageId);
  };
  
  const handleGenerate = async () => {
    if (!currentPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    try {
      const { taskId } = await createGenerateTask({
        imageIds: selectedImageIds,
        modelName: currentModel,
        prompt: currentPrompt,
        params: currentParams,
      });
      
      const nodeId = `node_${Date.now()}`;
      addNode({
        id: nodeId,
        type: 'generateNode',
        position: { x: 400, y: 100 },
        data: {
          taskId,
          modelName: currentModel,
          prompt: currentPrompt,
          status: 'pending',
          progress: 0,
          resultImages: [],
        },
      });
      
      const createdEdgeIds: string[] = [];
      selectedImageIds.forEach((imageId) => {
        const imageNode = nodes.find(node => 
          node.type === 'imageNode' && node.data.imageId === imageId
        );
        
        if (imageNode) {
          const edgeId = `edge_${imageNode.id}_${nodeId}`;
          createdEdgeIds.push(edgeId);
          addEdge({
            id: edgeId,
            source: imageNode.id,
            target: nodeId,
            type: 'default',
            animated: true,
            style: { stroke: '#4CAF50', strokeWidth: 2 },
          });
        }
      });
      
      const interval = setInterval(async () => {
        const status = await getTaskStatus(taskId);
        
        updateNode(nodeId, {
          status: status.status,
          progress: status.progress,
          resultImages: status.resultImages,
          error: status.error,
        });
        
        if (status.status === 'success' || status.status === 'failed') {
          clearInterval(interval);
          createdEdgeIds.forEach(edgeId => {
            updateEdge(edgeId, { 
              animated: false,
              style: { stroke: status.status === 'success' ? '#4CAF50' : '#ff4d4f', strokeWidth: 2 }
            });
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(26, 26, 26, 0.95)',
      borderRadius: '30px',
      padding: '18px 25px',
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      minWidth: '900px',
      backdropFilter: 'blur(10px)',
    }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      {/* Upload Button */}
      <Button
        type="text"
        shape="circle"
        icon={<PlusOutlined />}
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: 'rgba(76, 175, 80, 0.2)',
          border: '1px solid #4CAF50',
          color: '#4CAF50',
          width: '48px',
          height: '48px',
        }}
        title="上传图片"
      />
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', maxWidth: '300px', overflowX: 'auto' }}>
        {selectedImageIds.map((imageId, index) => {
          const imageNode = nodes.find(n => n.type === 'imageNode' && n.data.imageId === imageId);
          if (!imageNode) return null;
          
          return (
            <div 
              key={imageId} 
              style={{ 
                position: 'relative', 
                width: '48px', 
                height: '48px',
                flexShrink: 0,
              }}
            >
              <img
                src={imageNode.data.url}
                alt={`selected-${index + 1}`}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '2px solid #4CAF50',
                }}
              />
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                width: '18px',
                height: '18px',
                background: '#4CAF50',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontSize: '10px',
                fontWeight: 'bold',
              }}>
                {index + 1}
              </div>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRemoveSelection(imageId);
                }}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '20px',
                  height: '20px',
                  background: '#ff4d4f',
                  border: 'none',
                  borderRadius: '50%',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      
      <TextArea
        value={currentPrompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={selectedImageIds.length > 0 
          ? `Selected ${selectedImageIds.length} images, please enter prompt...` 
          : "Enter a description of what you want to generate"
        }
        autoSize={{ minRows: 1, maxRows: 3 }}
        bordered={false}
        style={{
          flex: 1,
          background: 'transparent',
          color: '#fff',
          resize: 'none',
          fontSize: '14px',
        }}
      />
      
      {/* Model Selection with Loading State */}
      <div style={{ position: 'relative' }}>
        <Spin spinning={modelsLoading} size="small">
          <Select
            value={currentModel}
            onChange={setModel}
            style={{ width: '180px' }}
            bordered={false}
            dropdownStyle={{ background: '#1a1a1a' }}
            suffixIcon={
              <InfoCircleOutlined 
                style={{ cursor: 'pointer', marginRight: '4px' }}
                onClick={() => setShowModelInfo(!showModelInfo)}
              />
            }
          >
            {models.length > 0 ? (
              models.map(model => (
                <Option key={model.modelId} value={model.modelId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{model.displayName}</span>
                    <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>
                      {model.provider}
                    </span>
                  </div>
                </Option>
              ))
            ) : (
              <Option value="default" disabled>Loading models...</Option>
            )}
          </Select>
        </Spin>
        
        {/* Model Info Tooltip */}
        {showModelInfo && modelDetail && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            width: '250px',
            marginBottom: '8px',
            fontSize: '12px',
            color: '#999',
            zIndex: 1000
          }}>
            <div style={{ marginBottom: '8px', color: '#4CAF50', fontWeight: 'bold' }}>
              {modelDetail.display_name}
            </div>
            <div style={{ marginBottom: '4px' }}>Provider: {modelDetail.provider?.display_name}</div>
            <div style={{ marginBottom: '4px' }}>Type: {modelDetail.model_type}</div>
            {modelDetail.description && (
              <div style={{ marginBottom: '4px', color: '#666' }}>{modelDetail.description}</div>
            )}
            {modelDetail.output_format && (
              <div>Output Format: {modelDetail.output_format}</div>
            )}
          </div>
        )}
      </div>
      
      <Select
        value={currentParams.ratio}
        onChange={(ratio) => setParams({ ...currentParams, ratio })}
        style={{ width: '100px' }}
        bordered={false}
        dropdownStyle={{ background: '#1a1a1a' }}
      >
        <Option value="1:1">1:1</Option>
        <Option value="16:9">16:9</Option>
        <Option value="9:16">9:16</Option>
      </Select>
      
      <Select
        value={currentParams.count}
        onChange={(count) => setParams({ ...currentParams, count })}
        style={{ width: '80px' }}
        bordered={false}
        dropdownStyle={{ background: '#1a1a1a' }}
      >
        <Option value={1}>1</Option>
        <Option value={2}>2</Option>
        <Option value={4}>4</Option>
      </Select>
      
      <Button
        type="primary"
        shape="circle"
        icon={<SendOutlined />}
        onClick={handleGenerate}
        disabled={modelsLoading || models.length === 0}
        style={{ 
          background: '#4CAF50', 
          border: 'none',
          position: 'relative'
        }}
      >
        {selectedImageIds.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#ff4d4f',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid #0a0a0a',
          }}>
            {selectedImageIds.length}
          </div>
        )}
      </Button>
    </div>
  );
};

export default BottomPanel;
