import type { NextPage } from 'next';
import { Button, Flex } from '@chakra-ui/react';

const Home: NextPage = () => {
  return (
    <Flex flexDirection={'column'}>
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Button variant={'transparent'} as={'a'} href={'/'}>
          Otoshidama
        </Button>
        <Button>Connect to Wallet</Button>
      </Flex>
    </Flex>
  );
};

export default Home;
