import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Card,
  Tabs,
  Collapse,
  Tag,
  Popconfirm,
  Empty,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import {
  getAvailableModels,
  getModelDetail,
  getAllProviders,
} from '../api/models';
import type { Model } from '../api/models';

interface ModelWithKeys extends Model {
  apiKeys?: any[];
  configs?: any[];
}

const ModelManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [models, setModels] = useState<ModelWithKeys[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelWithKeys | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showApiKeyDetail, setShowApiKeyDetail] = useState(false);
  const [keyForm] = Form.useForm();
  const [configForm] = Form.useForm();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // 加载模型列表
  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await getAvailableModels();
      
      // 为每个模型加载详细信息
      const modelsWithDetails = await Promise.all(
        response.models.map(async (model) => {
          try {
            const detail = await getModelDetail(model.id);
            return {
              ...model,
              apiKeys: detail.api_keys || [],
              configs: detail.configs || [],
            };
          } catch (error) {
            return {
              ...model,
              apiKeys: [],
              configs: [],
            };
          }
        })
      );
      
      setModels(modelsWithDetails);
    } catch (error) {
      message.error('加载模型列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载提供商列表
  const loadProviders = async () => {
    try {
      const response = await getAllProviders();
      setProviders(response.providers || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  useEffect(() => {
    loadModels();
    loadProviders();
  }, []);

  // 打开 API 密钥管理页面
  const handleManageKeys = (model: ModelWithKeys) => {
    setSelectedModel(model);
    setShowApiKeyDetail(true);
  };

  // 添加 API 密钥
  const handleAddApiKey = async (values: any) => {
    if (!selectedModel) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/models/${selectedModel.id}/api-keys`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        message.success('API密钥添加成功');
        keyForm.resetFields();
        setShowKeyModal(false);
        loadModels();
      } else {
        message.error('添加API密钥失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  // 停用 API 密钥
  const handleDeactivateKey = async (keyId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/models/keys/${keyId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        message.success('API密钥已停用');
        loadModels();
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  // 添加或更新模型配置
  const handleSaveConfig = async (values: any) => {
    if (!selectedModel) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/models/${selectedModel.id}/configs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
            config_value: JSON.parse(values.config_value || '{}'),
          }),
        }
      );

      if (response.ok) {
        message.success('配置保存成功');
        configForm.resetFields();
        setShowConfigModal(false);
        loadModels();
      } else {
        message.error('保存失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  // 切换密钥可见性
  const toggleKeyVisibility = (keyId: string) => {
    const newSet = new Set(visibleKeys);
    if (newSet.has(keyId)) {
      newSet.delete(keyId);
    } else {
      newSet.add(keyId);
    }
    setVisibleKeys(newSet);
  };

  // 模型表格列定义
  const modelColumns = [
    {
      title: '模型名称',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150,
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'API密钥',
      dataIndex: ['apiKeys', 'length'],
      key: 'apiKeyCount',
      width: 100,
      render: (count: number) => (
        <Tag color={count > 0 ? 'green' : 'red'}>
          {count > 0 ? `${count}个` : '未配置'}
        </Tag>
      ),
    },
    {
      title: '配置项',
      dataIndex: ['configs', 'length'],
      key: 'configCount',
      width: 100,
      render: (count: number) => (
        <span>{count}项</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: ModelWithKeys) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={() => handleManageKeys(record)}
          >
            API密钥
          </Button>
          <Button
            size="small"
            onClick={() => {
              setSelectedModel(record);
              setShowConfigModal(true);
            }}
          >
            配置
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="模型和API管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('新增模型请在后端配置')}>
            新增模型
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={modelColumns}
            dataSource={models}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="暂无模型数据" /> }}
          />
        </Spin>
      </Card>

      {/* API 密钥管理模态框 */}
      <Modal
        title={`${selectedModel?.displayName} - API密钥管理`}
        open={showApiKeyDetail}
        onCancel={() => setShowApiKeyDetail(false)}
        width={900}
        footer={null}
      >
        <Tabs
          items={[
            {
              key: 'keys',
              label: 'API密钥列表',
              children: (
                <div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowKeyModal(true)}
                    style={{ marginBottom: '16px' }}
                  >
                    添加API密钥
                  </Button>

                  {selectedModel?.apiKeys && selectedModel.apiKeys.length > 0 ? (
                    <Table
                      columns={[
                        {
                          title: 'API密钥',
                          dataIndex: 'api_key',
                          key: 'api_key',
                          width: 300,
                          render: (text: string, record: any) => (
                            <Space>
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                }}
                              >
                                {visibleKeys.has(record.id)
                                  ? text
                                  : text.substring(0, 10) + '...'}
                              </span>
                              <Button
                                type="text"
                                size="small"
                                icon={
                                  visibleKeys.has(record.id) ? (
                                    <EyeInvisibleOutlined />
                                  ) : (
                                    <EyeOutlined />
                                  )
                                }
                                onClick={() =>
                                  toggleKeyVisibility(record.id)
                                }
                              />
                            </Space>
                          ),
                        },
                        {
                          title: '状态',
                          dataIndex: 'is_active',
                          key: 'is_active',
                          width: 80,
                          render: (active: boolean) => (
                            <Tag color={active ? 'green' : 'red'}>
                              {active ? '活跃' : '已停用'}
                            </Tag>
                          ),
                        },
                        {
                          title: '配额',
                          dataIndex: 'quota_limit',
                          key: 'quota',
                          width: 120,
                          render: (limit: number, record: any) =>
                            limit ? (
                              <span>
                                {record.quota_used || 0} / {limit}
                              </span>
                            ) : (
                              '无限制'
                            ),
                        },
                        {
                          title: '过期时间',
                          dataIndex: 'expires_at',
                          key: 'expires_at',
                          width: 150,
                          render: (time: string) =>
                            time
                              ? new Date(time).toLocaleDateString('zh-CN')
                              : '永久有效',
                        },
                        {
                          title: '操作',
                          key: 'action',
                          width: 100,
                          render: (_: any, record: any) => (
                            <Popconfirm
                              title="确认停用此密钥?"
                              onConfirm={() =>
                                handleDeactivateKey(record.id)
                              }
                            >
                              <Button
                                type="text"
                                danger
                                size="small"
                              >
                                停用
                              </Button>
                            </Popconfirm>
                          ),
                        },
                      ]}
                      dataSource={selectedModel.apiKeys}
                      rowKey="id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="还没有配置API密钥" />
                  )}
                </div>
              ),
            },
            {
              key: 'info',
              label: '模型信息',
              children: selectedModel ? (
                <Collapse
                  items={[
                    {
                      key: 'basic',
                      label: '基本信息',
                      children: (
                        <Row gutter={16}>
                          <Col span={12}>
                            <div style={{ marginBottom: '12px' }}>
                              <strong>模型名称:</strong> {selectedModel.displayName}
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <strong>Provider:</strong> {selectedModel.provider}
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ marginBottom: '12px' }}>
                              <strong>输出格式:</strong> {selectedModel.outputFormat}
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <strong>描述:</strong> {selectedModel.description || '无'}
                            </div>
                          </Col>
                        </Row>
                      ),
                    },
                  ]}
                />
              ) : null,
            },
          ]}
        />
      </Modal>

      {/* 添加 API 密钥模态框 */}
      <Modal
        title="添加API密钥"
        open={showKeyModal}
        onOk={() => keyForm.submit()}
        onCancel={() => {
          setShowKeyModal(false);
          keyForm.resetFields();
        }}
      >
        <Form
          form={keyForm}
          layout="vertical"
          onFinish={handleAddApiKey}
        >
          <Form.Item
            label="API密钥"
            name="api_key"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="sk-xxx..." />
          </Form.Item>

          <Form.Item
            label="配额限制"
            name="quota_limit"
            rules={[{ type: 'number', message: '请输入数字' }]}
          >
            <InputNumber
              placeholder="留空表示无限制"
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="过期时间"
            name="expires_at"
            rules={[]}
          >
            <Input type="datetime-local" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型配置模态框 */}
      <Modal
        title={`${selectedModel?.displayName} - 模型配置`}
        open={showConfigModal}
        onOk={() => configForm.submit()}
        onCancel={() => {
          setShowConfigModal(false);
          configForm.resetFields();
        }}
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleSaveConfig}
        >
          <Form.Item
            label="配置键"
            name="config_key"
            rules={[{ required: true, message: '请输入配置键' }]}
          >
            <Input placeholder="如: pricing, limits, parameters" />
          </Form.Item>

          <Form.Item
            label="配置值 (JSON格式)"
            name="config_value"
            rules={[
              { required: true, message: '请输入配置值' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject(
                      new Error('请输入有效的JSON格式')
                    );
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder='{"key": "value"}'
            />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea
              rows={2}
              placeholder="配置的说明"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelManagement;
