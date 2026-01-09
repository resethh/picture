import http from './http';

export interface Model {
  id: string;
  modelId: string;
  displayName: string;
  description?: string;
  provider: string;
  providerDisplayName: string;
  inputParams?: Record<string, any>;
  outputFormat: string;
}

export interface AvailableModelsResponse {
  models: Model[];
  total: number;
}

export interface ModelDetail {
  id: string;
  model_name: string;
  display_name: string;
  description?: string;
  model_type: string;
  input_params?: Record<string, any>;
  output_format: string;
  is_active: boolean;
  sort_order: number;
  provider_id: string;
  provider: {
    id: string;
    name: string;
    display_name: string;
    base_url: string;
    api_key_header: string;
  };
  api_keys: Array<any>;
  configs: Array<any>;
}

/**
 * Get available AI models list for frontend
 */
export const getAvailableModels = async (): Promise<AvailableModelsResponse> => {
  const response = await http.get('/api/models');
  return response.data;
};

/**
 * Get detailed information of a specific model
 */
export const getModelDetail = async (modelId: string): Promise<ModelDetail> => {
  const response = await http.get(`/api/models/${modelId}`);
  return response.data;
};

/**
 * Get all providers
 */
export const getAllProviders = async () => {
  const response = await http.get('/api/models/providers');
  return response.data;
};

/**
 * Get model configuration
 */
export const getModelConfig = async (modelId: string, configKey: string) => {
  const response = await http.get(`/api/models/${modelId}/configs/${configKey}`);
  return response.data;
};

/**
 * Get all configurations for a model
 */
export const getModelConfigs = async (modelId: string) => {
  const response = await http.get(`/api/models/${modelId}/configs`);
  return response.data;
};
