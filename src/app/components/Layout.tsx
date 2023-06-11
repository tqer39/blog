import { FC, ReactNode } from 'react';
import { Grid, GridItem } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <Grid
      templateAreas={`"header"
                  "contents"
                  "footer"`}
    >
      <GridItem area={'header'}>
        <Header blogTitle={"tqer39's blog"} />
      </GridItem>
      <GridItem pl={2} area={'contents'}>
        {children}
      </GridItem>
      <GridItem area={'footer'}>
        <Footer />
      </GridItem>
    </Grid>
  );
};

export default Layout;
