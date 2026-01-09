export interface ImageNodeData {
  imageId: string;
  url: string;
  width: number;
  height: number;
}

export interface GenerateNodeData {
  taskId: string;
  modelName: string;
  prompt: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  progress: number;
  resultImages: ResultImage[];
  error?: string;
}

export interface ResultImage {
  imageId: string;
  url: string;
}

export interface GenerateParams {
  ratio: string;
  count: number;
}
