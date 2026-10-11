import axiosClient from './axiosClient';

export const recommendationApi = {
  getRecommendations: (resumeId = null) => {
    const url = resumeId ? `/recommendations?resumeId=${resumeId}` : '/recommendations';
    return axiosClient.get(url);
  },
};

export default recommendationApi;
