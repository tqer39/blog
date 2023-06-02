import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  return (
    <div>
      <Header />
      <main>
        Contents
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
