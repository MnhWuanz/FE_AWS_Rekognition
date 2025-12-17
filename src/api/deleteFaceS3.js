export const deleteFaceS3 = async (lop, mssv) => {
  const apiUrl = `https://xsdmsguxpc.execute-api.ap-southeast-1.amazonaws.com/dev/deleteFace/${lop}/${mssv}`;
  try {
    await fetch(apiUrl, {
      method: 'DELETE', // Quan trọng: Phải là DELETE
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Lỗi gọi API:', error);
    alert('Lỗi hệ thống!');
  }
};
