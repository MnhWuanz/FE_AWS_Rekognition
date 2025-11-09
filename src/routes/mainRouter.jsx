import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login/LoginPage';
import AdminPage from '../pages/Admin/AdminPage';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/Animation/PageTransition';

import UserPage from '../pages/Admin/components/UserPage';
import QRPage from '../pages/Admin/Pages/QR/QRPage';

const MainRouter = () => {
  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Routes>
          <Route
            path="/"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route path="/admin" element={<AdminPage />}>
            <Route path="addFace" element={<QRPage />} />
            <Route path="User" element={<UserPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default MainRouter;
