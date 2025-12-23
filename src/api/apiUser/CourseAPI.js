import axiosClient from './axiosClient';

const courseAPI = {
  getAll: () => axiosClient.get('/course'),
  getById: (id) => axiosClient.get(`/course/${id}`),
  createCourse: (data) => axiosClient.post('/course', data),
  updateCourse: (data) => axiosClient.put(`/course`, data),
  deleteCourse: (id) => axiosClient.delete(`/course/${id}`),
};

export default courseAPI;
