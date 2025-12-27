import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login/LoginPage';
import UserPage from '../pages/UserPage/UserPage';
import QRPage from '../pages/QR/QRPage';
import AdminPage from '../pages/Admin/AdminPage';
import RegisterPage from '../pages/Register/RegisterPage';
import CheckAuth from '../auth/CheckAuth';
import ManagerFace from '../pages/ManagerFaces/ManagerFace';
import FaceRollCall from '../pages/FaceRollCall/FaceRollCall';
import AddUser from '../pages/addUser/addUser';

import CourseManagement from '../pages/CourseManagement/CourseManagement';
import SessionManagement from '../pages/SessionManagement/SessionManagement';
const MainRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<CheckAuth allowedRoles={['admin', 'lecturer']} />}>
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<UserPage />} />
            <Route path="addFace" element={<QRPage />} />
            <Route path="User" element={<UserPage />} />
            <Route path="ListStudentsFaces" element={<ManagerFace />} />
            <Route path="FaceRollCall" element={<FaceRollCall />} />
            <Route path="addUser" element={<AddUser />} />
            <Route path="SessionManagement" element={<SessionManagement />} />
            <Route path="CourseManagement" element={<CourseManagement />} />
          </Route>
        </Route>
        <Route path="/registerFace" element={<RegisterPage />} />
      </Routes>
    </>
  );
};

export default MainRouter;
