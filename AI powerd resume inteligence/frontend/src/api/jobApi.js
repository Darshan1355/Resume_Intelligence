import axiosClient from './axiosClient';

export const jobApi = {
  create: (data) => axiosClient.post('/jobs', data),
  getAll: () => axiosClient.get('/jobs'),
  getById: (id) => axiosClient.get(`/jobs/${id}`),
  delete: (id) => axiosClient.delete(`/jobs/${id}`),
};

export default jobApi;
