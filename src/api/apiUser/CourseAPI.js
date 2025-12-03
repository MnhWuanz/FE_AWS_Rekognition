import axiosClient from './axiosClient';

const courseAPI = {
  getAll: () => axiosClient.get('/course'),
  getById: (id) => axiosClient.get(`/course/${id}`),
  createCourse: (data) => axiosClient.post('/course', data),
  updateCourse: (id, data) => axiosClient.put(`/course/${id}`, data),
  deleteCourse: (id) => axiosClient.delete(`/course/${id}`),
};

export default courseAPI;
