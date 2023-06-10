import NextLink from 'next/link';
import { FC } from 'react';
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  useBreakpointValue,
  Spacer,
} from '@chakra-ui/react';
import ColorModeToggle from './ColorModeToggle';

interface HeaderProps {
  blogTitle: string;
}

const Header: FC<HeaderProps> = ({ blogTitle }) => {
  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
          >
            <NextLink href={'/'} passHref>
              {blogTitle}
            </NextLink>
          </Text>
        </Flex>
        <Spacer />
        <Flex>
          <ColorModeToggle />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
