import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;

export const getContent = () => api.get('/content');
export const login = (credentials: any) => api.post('/admin/login', credentials);
export const logout = () => api.post('/admin/logout');
export const getMe = () => api.get('/admin/me');

export const updateSection = (section: string, content: any) => api.put(`/content/${section}`, content);
export const updateCase = (id: number, data: any) => api.put(`/content/cases/${id}`, data);
export const updatePricing = (id: number, data: any) => api.put(`/content/pricing/${id}`, data);
export const updateProcess = (id: number, data: any) => api.put(`/content/process/${id}`, data);
export const updateProblem = (id: number, data: any) => api.put(`/content/problem-cards/${id}`, data);
export const updateBenefit = (id: number, data: any) => api.put(`/content/benefit-cards/${id}`, data);
export const updateFaq = (id: number, data: any) => api.put(`/content/faq/${id}`, data);

export const createCase = (data: any) => api.post('/content/cases', data);
export const deleteCase = (id: number) => api.delete(`/content/cases/${id}`);

export const createFaq = (data: any) => api.post('/content/faq', data);
export const deleteFaq = (id: number) => api.delete(`/content/faq/${id}`);

export const getLeads = () => api.get('/content/leads/all');
export const updateLeadStatus = (id: number, status: string) => api.put(`/content/leads/${id}/status`, { status });
export const deleteLead = (id: number) => api.delete(`/content/leads/${id}`);

// Stats
export const getLeadStats = () => api.get('/stats/leads');
export const getStatusDistribution = () => api.get('/stats/status-distribution');

// Articles
export const getAdminArticles = () => api.get('/articles/admin/all');
export const getArticles = () => api.get('/articles');
export const getArticle = (slug: string) => api.get(`/articles/${slug}`);
export const createArticle = (data: any) => api.post('/articles', data);
export const updateArticle = (id: number, data: any) => api.put(`/articles/${id}`, data);
export const deleteArticle = (id: number) => api.delete(`/articles/${id}`);

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
