import React, { useState } from 'react';
import { Button, QRCode, Space } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import logo from '../../../../public/logo.png';
const Content = ({ isActive = false }) => {
  const [size, setSize] = useState(350);
  const MIN_SIZE = 48;
  const MAX_SIZE = 500;
  const increase = () => {
    setSize((prevSize) => {
      const newSize = prevSize + 10;
      if (newSize >= MAX_SIZE) {
        return MAX_SIZE;
      }
      return newSize;
    });
  };
  const decline = () => {
    setSize((prevSize) => {
      const newSize = prevSize - 10;
      if (newSize <= MIN_SIZE) {
        return MIN_SIZE;
      }
      return newSize;
    });
  };
  return (
    <>
      <Space.Compact style={{ marginBottom: 16, display: 'block' }}>
        <Button
          onClick={decline}
          disabled={size <= MIN_SIZE}
          icon={<MinusOutlined />}
        >
          Smaller
        </Button>
        <Button
          onClick={increase}
          disabled={size >= MAX_SIZE}
          icon={<PlusOutlined />}
        >
          Larger
        </Button>
      </Space.Compact>
      <QRCode
        errorLevel="H"
        size={size}
        iconSize={size / 4}
        status={isActive ? 'active' : 'expired'}
        value={`https://stu.mnhwua.id.vn/registerFace`}
        icon={logo}
      />
    </>
  );
};

export default Content;
