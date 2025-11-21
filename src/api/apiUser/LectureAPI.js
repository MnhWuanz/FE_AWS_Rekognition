import axiosClient from './axiosClient';

const lecturerAPI = {
  getAll: () => axiosClient.get('/lecturer'),
  getById: (id) => axiosClient.get(`/lecturer/${id}`),
  createLecturer: (data) => axiosClient.post('/lecturer', data),
  updateLecturer: (id, data) => axiosClient.put(`/lecturer/${id}`, data),
  deleteLecturer: (id) => axiosClient.delete(`/lecturer/${id}`),
};
export default lecturerAPI;
