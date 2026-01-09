import http from './http';

export const saveProject = async (data: { id?: string; name: string; graph: any }) => {
  const response = await http.post('/api/projects', data);
  return response.data;
};

export const loadProject = async (projectId: string) => {
  const response = await http.get(`/api/projects/${projectId}`);
  return response.data;
};

export const getProjectList = async () => {
  const response = await http.get('/api/projects');
  return response.data;
};

export const getPublicProjects = async () => {
  const response = await http.get('/api/projects/public');
  return response.data;
};

export const shareProject = async (projectId: string) => {
  const response = await http.post(`/api/projects/${projectId}/share`);
  return response.data;
};
