import axiosClient from './axiosClient';

export const resumeApi = {
  upload: (formData) => axiosClient.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => axiosClient.get('/resumes'),
  getById: (id) => axiosClient.get(`/resumes/${id}`),
  delete: (id) => axiosClient.delete(`/resumes/${id}`),
};

export default resumeApi;
