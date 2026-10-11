import axiosClient from './axiosClient';

export const matchingApi = {
  analyze: (data) => axiosClient.post('/matching/analyze', data),
  getById: (id) => axiosClient.get(`/matching/${id}`),
};

export default matchingApi;
