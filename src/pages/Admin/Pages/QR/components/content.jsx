import React from 'react';
import { Input, QRCode, Space } from 'antd';
const Content = ({ isActive = false, link = 'https://www.sgu.edu.vn/' }) => {
  return (
    <div>
      <Space direction="vertical" align="center">
        <QRCode
          value={link || 'https://www.sgu.edu.vn/'}
          size={500}
          status={isActive ? 'active' : 'expired'}
          link={link}
        />
      </Space>
    </div>
  );
};

export default Content;
