import { FC } from 'react';
import { Grid, GridItem } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';
import RightPane from './RightPane';
import ArticleList from './ArticleList';

const Layout: FC = () => {
  return (
    <Grid
      templateAreas={`"header header"
                  "article-list right-pane"
                  "footer footer"`}
    >
      <GridItem area={'header'}>
        <Header blogTitle={'tqer39\'s blog'} />
      </GridItem>
      <GridItem pl={2} area={'article-list'}>
        <ArticleList />
      </GridItem>
      <GridItem pl={2} area={'right-pane'}>
        <RightPane />
      </GridItem>
      <GridItem area={'footer'}>
        <Footer />
      </GridItem>
    </Grid>
  );
};

export default Layout;
