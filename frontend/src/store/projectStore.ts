import { create } from 'zustand';
import {  Node, Edge, Viewport } from 'reactflow';

interface ProjectStore {
  projectId: string | null;
  projectName: string;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  selectedImageIds: string[];
  
  setProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  toggleImageSelection: (imageId: string) => void;
  clearImageSelection: () => void;
  loadProject: (projectData: { id: string; name: string; graph: { nodes: Node[]; edges: Edge[]; viewport: Viewport } }) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projectId: null,
  projectName: '未命名',
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedImageIds: [],
  
  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setViewport: (viewport) => set({ viewport }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    ),
  })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  updateEdge: (id, updates) => set((state) => ({
    edges: state.edges.map((edge) =>
      edge.id === id ? { ...edge, ...updates } : edge
    ),
  })),
  toggleImageSelection: (imageId) => set((state) => ({
    selectedImageIds: state.selectedImageIds.includes(imageId)
      ? state.selectedImageIds.filter(id => id !== imageId)
      : [...state.selectedImageIds, imageId]
  })),
  clearImageSelection: () => set({ selectedImageIds: [] }),
  loadProject: (projectData) => set({
    projectId: projectData.id,
    projectName: projectData.name,
    nodes: projectData.graph.nodes || [],
    edges: projectData.graph.edges || [],
    viewport: projectData.graph.viewport || { x: 0, y: 0, zoom: 1 },
  }),
  resetProject: () => set({
    projectId: null,
    projectName: '未命名',
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    selectedImageIds: [],
  }),
}));
