import axiosClient from './axiosClient';
const studentApi = {
  getAll: () => axiosClient.get('/student'),
  getById: (id) => axiosClient.get(`/student/${id}`),
  createUser: (data) => axiosClient.post('/student', data),
  updateUser: (data) => axiosClient.put(`/student`, data),
  deleteUser: (id) => axiosClient.delete(`/student/${id}`),
};
export default studentApi;
