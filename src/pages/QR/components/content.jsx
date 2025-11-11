import React from 'react';
import { Input, QRCode, Space } from 'antd';
const Content = ({ isActive = false }) => {
  return (
    <div>
      <Space direction="vertical" align="center">
        <QRCode
          value={`https://stu.mnhwua.id.vn/registerFace`}
          size={500}
          status={isActive ? 'active' : 'expired'}
        />
      </Space>
    </div>
  );
};

export default Content;
