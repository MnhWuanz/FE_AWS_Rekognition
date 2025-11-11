import axiosClient from './axiosClient';

export const get_token = async () => {
  try {
    const response = await axiosClient.get('/get_token.php');
    return response.data;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

export const save_token = async (data) => {
  try {
    const response = await axiosClient.post('/save_token.php', data);
    return response.data;
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};
