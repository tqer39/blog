import { FC } from 'react';
import Header from './Header';
import Footer from './Footer';
import RightPane from './RightPane';
import ArticleList from './ArticleList';

const Layout: FC = () => {
  return (
    <>
      <Header blogTitle={'engineering logs'} />
      <ArticleList />
      <RightPane />
      <Footer />
    </>
  );
}

export default Layout;
