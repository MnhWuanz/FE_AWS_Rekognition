import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login/LoginPage';

import UserPage from '../pages/Admin/components/UserPage';

import QRPage from '../pages/QR/QRPage';
import AdminPage from '../pages/Admin/AdminPage';
import RegisterPage from '../pages/Register/RegisterPage';
import CheckAuth from '../auth/CheckAuth';
import ManagerFace from '../pages/ManagerFaces/ManagerFace';

const MainRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<CheckAuth allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />}>
            <Route path="addFace" element={<QRPage />} />
            <Route path="User" element={<UserPage />} />
            <Route path="ListStudentsFaces" element={<ManagerFace />} />
          </Route>
        </Route>
        <Route path="/registerFace" element={<RegisterPage />} />
      </Routes>
    </>
  );
};

export default MainRouter;
