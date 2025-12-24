import axiosClient from './axiosClient';

const sessionApi = {
  getAll: () => axiosClient.get('/session'),
  getById: (id) => axiosClient.get(`/session/${id}`),
  createSession: (data) => axiosClient.post('/session', data),
  updateSession: (data) => axiosClient.put(`/session`, data),
  deleteSession: (id) => axiosClient.delete(`/session/${id}`),
};
export default sessionApi;
