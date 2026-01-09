import React, { useEffect, useState } from 'react';
import { Card, Spin, Empty, Divider, Tag, Space } from 'antd';
import { getModelDetail, getModelConfigs } from '../../api/models';

interface ModelConfigPanelProps {
  modelId: string;
}

const ModelConfigPanel: React.FC<ModelConfigPanelProps> = ({ modelId }) => {
  const [detail, setDetail] = useState<any>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModelData();
  }, [modelId]);

  const loadModelData = async () => {
    try {
      setLoading(true);
      const [detailData, configsData] = await Promise.all([
        getModelDetail(modelId),
        getModelConfigs(modelId).catch(() => ({ configs: [] }))
      ]);
      
      setDetail(detailData);
      setConfigs(configsData.configs || []);
    } catch (error) {
      console.error('Failed to load model config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin />;
  }

  if (!detail) {
    return <Empty description="Model not found" />;
  }

  return (
    <Card
      title={`Model: ${detail.display_name}`}
      style={{
        background: 'rgba(26, 26, 26, 0.9)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Basic Info */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#4CAF50', marginBottom: '8px' }}>Basic Information</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#888' }}>Model Name:</span>
            <div style={{ color: '#fff' }}>{detail.model_name}</div>
          </div>
          <div>
            <span style={{ color: '#888' }}>Type:</span>
            <div style={{ color: '#fff' }}>{detail.model_type}</div>
          </div>
          <div>
            <span style={{ color: '#888' }}>Provider:</span>
            <div style={{ color: '#fff' }}>{detail.provider?.display_name}</div>
          </div>
          <div>
            <span style={{ color: '#888' }}>Output Format:</span>
            <div style={{ color: '#fff' }}>{detail.output_format}</div>
          </div>
        </div>
        
        {detail.description && (
          <>
            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <div>
              <span style={{ color: '#888', display: 'block', marginBottom: '4px' }}>Description:</span>
              <div style={{ color: '#bbb', fontSize: '12px' }}>{detail.description}</div>
            </div>
          </>
        )}
      </div>

      {/* Provider Info */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#4CAF50', marginBottom: '8px' }}>Provider Information</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#888' }}>Provider:</span>
            <div style={{ color: '#fff' }}>{detail.provider?.name}</div>
          </div>
          <div>
            <span style={{ color: '#888' }}>Base URL:</span>
            <div style={{ color: '#999', fontSize: '11px', wordBreak: 'break-all' }}>
              {detail.provider?.base_url}
            </div>
          </div>
          <div>
            <span style={{ color: '#888' }}>API Key Header:</span>
            <div style={{ color: '#fff' }}>{detail.provider?.api_key_header}</div>
          </div>
        </div>
      </div>

      {/* Input Parameters */}
      {detail.input_params && Object.keys(detail.input_params).length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '8px' }}>Input Parameters</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            {Object.entries(detail.input_params).map(([key, value]: [string, any]) => (
              <div key={key}>
                <span style={{ color: '#888' }}>{key}:</span>
                <div style={{ color: '#fff' }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Configs */}
      {configs.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '8px' }}>Configuration</h4>
          {configs.map((config, index) => (
            <div key={config.id} style={{ marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ marginBottom: '4px' }}>
                <Tag color="green">{config.config_key}</Tag>
              </div>
              {config.description && (
                <div style={{ color: '#888', marginBottom: '4px' }}>{config.description}</div>
              )}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <pre style={{ margin: 0, color: '#999', fontSize: '11px' }}>
                  {JSON.stringify(config.config_value, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Keys Status */}
      {detail.api_keys && detail.api_keys.length > 0 && (
        <div>
          <h4 style={{ color: '#4CAF50', marginBottom: '8px' }}>API Keys ({detail.api_keys.length})</h4>
          <div style={{ fontSize: '12px' }}>
            {detail.api_keys.map((key: any, index: number) => (
              <div
                key={key.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  background: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  border: `1px solid rgba(76, 175, 80, 0.2)`,
                }}
              >
                <Space>
                  <span style={{ color: '#888' }}>Key #{index + 1}</span>
                  {key.is_active ? (
                    <Tag color="green">Active</Tag>
                  ) : (
                    <Tag color="red">Inactive</Tag>
                  )}
                  {key.expires_at && (
                    <span style={{ color: '#888' }}>Expires: {new Date(key.expires_at).toLocaleDateString()}</span>
                  )}
                </Space>
                {key.quota_limit && (
                  <div style={{ color: '#888' }}>
                    Quota: {key.quota_used || 0} / {key.quota_limit}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ModelConfigPanel;
