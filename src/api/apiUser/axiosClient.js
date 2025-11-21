import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://oupzf1w6yj.execute-api.ap-southeast-1.amazonaws.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
