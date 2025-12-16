import axiosClient from './axiosClient';

const userAPI = {
  getAll: () => axiosClient.get('/user'),
  getById: (id) => axiosClient.get(`/user/${id}`),
  createUser: (data) => axiosClient.post('/user', data),
  updateUser: (data) => axiosClient.put(`/user/`, data),
  deleteUser: (id) => axiosClient.delete(`/user/${id}`),
};
export default userAPI;
