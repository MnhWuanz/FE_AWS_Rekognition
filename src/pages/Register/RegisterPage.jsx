import React from 'react';
import { useSearchParams } from 'react-router-dom';

const RegisterPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  //Lấy token từ admin để tạo

  const saved = JSON.parse(localStorage.getItem('activeToken'));
  if (!token || token !== saved) {
    return <div>Token không hợp lệ hoặc đã hết hạn</div>;
  }
  return (
    <div>
      RegisterPage {token} {saved}
    </div>
  );
};

export default RegisterPage;
