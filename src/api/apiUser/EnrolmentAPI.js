import axiosClient from './axiosClient';

const enrolmentApi = {
  getAll: () => axiosClient.get('/enrolment'),
  getById: (id) => axiosClient.get(`/enrolment/${id}`),
  getByCourseId: (courseId) =>
    axiosClient.get(`/enrolment?courseId=${courseId}`),
  createEnrolment: (data) => axiosClient.post('/enrolment', data),
  updateEnrolment: (data) => axiosClient.put(`/enrolment`, data),
  deleteEnrolment: (id) => axiosClient.delete(`/enrolment/${id}`),
};
export default enrolmentApi;
