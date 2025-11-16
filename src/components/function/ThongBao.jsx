import React, { useEffect } from 'react';
import { notification } from 'antd';

const ThongBao = ({
  level = 'info',
  description = '',
  placement = 'top',
  message = '',
}) => {
  const [api, contextHolder] = notification.useNotification();
  useEffect(() => {
    api[level]({
      message: message,
      description: description,
      placement: placement,
    });
  }, [level, description, placement, message]);

  return <>{contextHolder}</>;
};

export default ThongBao;
