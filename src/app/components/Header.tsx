import { FC } from 'react';
import NextLink from 'next/link';
import { Box, Container, Flex, Heading, Link } from '@chakra-ui/react';

interface HeaderProps {
  blogTitle: string;
}

const Header: FC<HeaderProps> = ({ blogTitle }) => {
  return (
    <Box px={4} bgColor="gray.100">
      <Container maxW="container.lg">
        <Flex
          as="header"
          py="4"
          justifyContent="space-between"
          alignItems="center"
        >
          <NextLink href="/" passHref>
            <Heading as="h1" fontSize="2xl" cursor="pointer">
              {blogTitle}
            </Heading>
          </NextLink>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
