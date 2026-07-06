import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div style={{ paddingBottom: '70px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Outlet renders the matched child route component */}
      <Outlet />
      
      {/* Fixed bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
