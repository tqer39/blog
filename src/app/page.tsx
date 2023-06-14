import { FC } from 'react';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import Articles from './articles/page';

const Page: FC = () => {
  return (
    <CacheProvider>
      <ChakraProvider>
        <Articles />
      </ChakraProvider>
    </CacheProvider>
  );
};

export default Page;
