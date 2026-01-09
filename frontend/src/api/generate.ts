import http from './http';
import { GenerateParams } from '../types';

export const createGenerateTask = async (data: {
  imageIds: string[];
  modelName: string;
  prompt: string;
  params: GenerateParams;
}) => {
  const response = await http.post('/api/generate', {
    ...data,
    mode: 'image',
  });
  return response.data;
};

export const getTaskStatus = async (taskId: string) => {
  const response = await http.get(`/api/generate/${taskId}`);
  return response.data;
};
