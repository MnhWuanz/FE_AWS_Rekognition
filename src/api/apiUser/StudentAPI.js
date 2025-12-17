import axiosClient from './axiosClient';
const studentApi = {
  getAll: () => axiosClient.get('/student'),
  getById: (id) => axiosClient.get(`/student/${id}`),
  createStudent: (data) => axiosClient.post('/student', data),
  updateStudent: (data) => axiosClient.put(`/student`, data),
  deleteStudent: (id) => axiosClient.delete(`/student/${id}`),
};
export default studentApi;
