import { create } from 'zustand';
import { GenerateParams } from '../types';
import { Model } from '../api/models';

interface GenerationStore {
  currentPrompt: string;
  currentModel: string;
  currentParams: GenerateParams;
  models: Model[];
  modelsLoading: boolean;
  modelsError: string | null;
  
  setPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setParams: (params: GenerateParams) => void;
  setModels: (models: Model[]) => void;
  setModelsLoading: (loading: boolean) => void;
  setModelsError: (error: string | null) => void;
  loadModels: () => Promise<void>;
}

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  currentPrompt: '',
  currentModel: 'dall-e-3',
  currentParams: {
    ratio: '1:1',
    count: 1,
  },
  models: [],
  modelsLoading: false,
  modelsError: null,
  
  setPrompt: (prompt) => set({ currentPrompt: prompt }),
  setModel: (model) => set({ currentModel: model }),
  setParams: (params) => set({ currentParams: params }),
  setModels: (models) => set({ models, modelsError: null }),
  setModelsLoading: (loading) => set({ modelsLoading: loading }),
  setModelsError: (error) => set({ modelsError: error }),
  
  loadModels: async () => {
    const { setModelsLoading, setModels, setModelsError } = get();
    
    try {
      setModelsLoading(true);
      // Dynamic import to avoid circular dependencies
      const { getAvailableModels } = await import('../api/models');
      const response = await getAvailableModels();
      setModels(response.models);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load models';
      setModelsError(errorMessage);
      console.error('Failed to load models:', error);
    } finally {
      setModelsLoading(false);
    }
  },
}));
