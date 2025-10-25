import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Login/LoginPage';
import AdminPage from '../pages/Admin/AdminPage';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/Animation/PageTransition';

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
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <AdminPage />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default MainRouter;
