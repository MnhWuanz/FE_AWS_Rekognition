import React from 'react';
import { Button, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid';

import './css/QRPage.css';
import { PoweroffOutlined } from '@ant-design/icons';
import Content from './components/content';

const QRPage = () => {
  const [isActive, setIsActive] = React.useState(false);
  const [token, setToken] = React.useState(null);
  const handleCreateQR = () => {
    const token = uuidv4();
    setToken(token);
    localStorage.setItem('activeToken', JSON.stringify(token));
    setIsActive((prev) => !prev);
  };
  return (
    <>
      <div className="bg-sky-500/50 p-3 flex justify-between items-center rounded-lg">
        <p className="subpixel-antialiased  font-semibold text-white text-lg ">
          Tạo mã QR
        </p>
        <div>
          <Button
            type={isActive ? 'primary' : 'default'}
            danger={!isActive}
            icon={<PoweroffOutlined />}
            onClick={handleCreateQR}
          >
            {isActive ? 'Tạo mã QR' : 'Hủy mã QR'}
          </Button>
        </div>
      </div>
      <div className="flex justify-center items-center mt-5">
        <Content isActive={isActive} isToken={token} />
      </div>
    </>
  );
};

export default QRPage;
