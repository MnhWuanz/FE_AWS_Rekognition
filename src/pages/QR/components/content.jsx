import React from 'react';
import { Input, QRCode, Space } from 'antd';
const Content = ({ isActive = false, isToken = null }) => {
  return (
    <div>
      <Space direction="vertical" align="center">
        <QRCode
          value={`/registerFace?token=${isToken}`}
          size={500}
          status={isActive ? 'active' : 'expired'}
        />
      </Space>
    </div>
  );
};

export default Content;
