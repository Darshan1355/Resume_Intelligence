import axiosClient from './axiosClient';

export const resumeApi = {
  upload: (formData) => axiosClient.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (archived = false) => axiosClient.get('/resumes', { params: { archived } }),
  getById: (id) => axiosClient.get(`/resumes/${id}`),
  archive: (id) => axiosClient.post(`/resumes/${id}/archive`),
  restore: (id) => axiosClient.post(`/resumes/${id}/restore`),
  delete: (id) => axiosClient.delete(`/resumes/${id}`),
};

export default resumeApi;
