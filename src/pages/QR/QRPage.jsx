import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

import './css/QRPage.css';
import { PoweroffOutlined } from '@ant-design/icons';
import Content from './components/content';
import { get_token, save_token } from '../../api/tokenAPI';
const QRPage = () => {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const data = await get_token();
        setIsActive(data.active);
      } catch (error) {
        console.log(error);
      }
    };
    fetchToken();
  }, []);
  const handleQR = async () => {
    const newState = !isActive;
    try {
      const req = await save_token({
        active: newState,
        api_key: 'mnhquan2004',
      });
      if (req.success) {
        setIsActive(newState);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="bg-sky-500/50 p-3 flex justify-between items-center rounded-lg">
        <p className="subpixel-antialiased  font-semibold text-white text-lg ">
          Tạo mã QR
        </p>
        <div>
          <Button
            type={isActive ? 'default' : 'primary'}
            danger={isActive}
            icon={<PoweroffOutlined />}
            onClick={handleQR}
          >
            {isActive ? 'Hủy mã QR' : 'Tạo mã QR'}
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
