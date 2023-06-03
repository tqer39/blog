'use client';

import { FC } from 'react';
import Layout from './components/Layout';
import { ChakraProvider } from '@chakra-ui/react';

const Page: FC = () => {
  return (
    <ChakraProvider>
      <Layout />
    </ChakraProvider>
  );
};

export default Page;
