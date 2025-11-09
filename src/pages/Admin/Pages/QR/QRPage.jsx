import React from 'react';
import { Button, Modal } from 'antd';

import './css/QRPage.css';
import {
  EditOutlined,
  PlusOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import Content from './components/content';
const QRPage = () => {
  const [isActive, setIsActive] = React.useState(false);

  const handleCreateQR = () => {
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
        <Content isActive={isActive} />
      </div>
    </>
  );
};

export default QRPage;
