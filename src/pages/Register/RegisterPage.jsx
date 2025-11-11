import React, { useEffect, useState } from 'react';

const RegisterPage = () => {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    fetch('https://stu.mnhwua.id.vn/api/get_token.php')
      .then((res) => res.json())
      .then((data) => setIsActive(data.active))
      .catch(() => setIsActive(false));
  }, []);
  if (!isActive) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 font-semibold text-lg">
          Mã QR không còn hiệu lực. Vui lòng liên hệ quản trị viên để kích hoạt
          lại.
        </p>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center h-screen">
      <p>Trang đăng ký</p>
    </div>
  );
};

export default RegisterPage;
