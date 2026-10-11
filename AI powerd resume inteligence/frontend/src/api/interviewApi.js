import axiosClient from './axiosClient';

export const interviewApi = {
  createSession: (data) => axiosClient.post('/interview/sessions', data),
  getSessions: () => axiosClient.get('/interview/sessions'),
  getSessionById: (id) => axiosClient.get(`/interview/sessions/${id}`),
  submitAnswer: (questionId, data) => axiosClient.post(`/interview/questions/${questionId}/answer`, data),
};

export default interviewApi;
