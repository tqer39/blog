import { Box, Flex, Text } from '@chakra-ui/react';

const Header = () => {
  return (
    <Box bg="teal.400">
      <Flex align="center" justify="space-between" p={5}>
        <Text color="white">Menu</Text>
      </Flex>
    </Box>
  );
};

export default Header;
