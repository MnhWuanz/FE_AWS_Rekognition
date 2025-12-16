import axios from 'axios';

// Sử dụng proxy trong development, API thực trong production
const baseURL = import.meta.env.DEV 
  ? '/api-aws'  // Sử dụng proxy khi dev (Vite sẽ proxy đến AWS)
  : 'https://oupzf1w6yj.execute-api.ap-southeast-1.amazonaws.com/api';  // API thực khi build

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
