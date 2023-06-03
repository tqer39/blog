import { FC } from 'react';
import Header from './Header';
import Footer from './Footer';
import RightPane from './RightPane';

const Layout: FC = () => {
  return (
    <>
      <Header blogTitle={'engineering logs'} />
      <RightPane />
      <Footer />
    </>
  );
}

export default Layout;
