import axiosClient from './axiosClient';

const attendanceApi = {
  getAll: () => axiosClient.get('/attendance'),
  getById: (id) => axiosClient.get(`/attendance/${id}`),
  createAttendance: (data) => axiosClient.post('/attendance', data),
  updateAttendance: (data) => axiosClient.put(`/attendance`, data),
  deleteAttendance: (id) => axiosClient.delete(`/attendance/${id}`),
};
export default attendanceApi;
