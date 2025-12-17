import React from 'react';
import { getUser } from '../utils/auth';
import { Navigate, Outlet } from 'react-router-dom';

const CheckAuth = ({ allowedRoles }) => {
  const user = getUser();
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};
export default CheckAuth;
