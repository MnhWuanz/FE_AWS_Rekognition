import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const Loading = ({ size = 40, tip = 'Đang tải...', full = false }) => {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: size,
      }}
      spin
    />
  );

  if (full) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin indicator={antIcon} tip={tip} />
      </div>
    );
  }

  return <Spin indicator={antIcon} tip={tip} />;
};

export default Loading;
