import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://stu.mnhwua.id.vn/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
