'use client';

import { FC } from 'react';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import Layout from './components/Layout';

const Page: FC = () => {
  return (
    <CacheProvider>
      <ChakraProvider>
        <Layout />
      </ChakraProvider>
    </CacheProvider>
  );
};

export default Page;
