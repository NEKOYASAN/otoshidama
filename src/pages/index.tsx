import type { NextPage } from 'next';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  NumberInput,
  NumberInputField,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { TwitterIcon } from '~/components/icons/TwitterIcon';
import { GitHubIcon } from '~/components/icons/GitHubIcon';

const Home: NextPage = () => {
  const [toAddress, setToAddress] = useState('');
  const [sendAmount, setSendAmount] = useState(0);
  return (
    <Flex flexDirection={'column'} alignItems={'center'} height={'100vh'}>
      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        maxW={'1200px'}
        w={'100%'}
        py={2}
        px={3}
      >
        <Button variant={'transparent'} as={'a'} href={'/'}>
          Otoshidama
        </Button>
        <Button>お財布につなぐ</Button>
      </Flex>
      <Flex
        alignItems={'center'}
        justifyContent={'center'}
        textAlign={'center'}
        flexDirection={'column'}
        flex={1}
        gap={5}
      >
        {/* TODO: デザイン差し替え&アニメーション追加*/}
        <Heading as={'h1'}>お年玉</Heading>
        <Input
          placeholder={'渡す相手'}
          value={toAddress}
          onChange={(event) => {
            setToAddress(event.target.value);
          }}
        />
        <InputGroup>
          <InputLeftAddon>&yen;</InputLeftAddon>
          <NumberInput
            placeholder={'包む金額'}
            value={sendAmount}
            onChange={(_, inputAmount) => {
              setSendAmount(inputAmount);
            }}
          >
            <NumberInputField roundedStart={0} />
          </NumberInput>
        </InputGroup>
        <Button colorScheme={'teal'}>お金をつつんで送る</Button>
      </Flex>
      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        maxW={'1200px'}
        w={'100%'}
        py={2}
        px={3}
      >
        <Text>ɴᴇᴋᴏʏᴀsᴀɴ</Text>
        <Flex gap={2}>
          <IconButton
            aria-label={'Twitter'}
            icon={<TwitterIcon />}
            as={'a'}
            target={'_blank'}
            rel={'noopener noreferrer'}
            href={'https://twitter.com/Nekoya3_'}
          />
          <IconButton
            aria-label={'Twitter'}
            icon={<GitHubIcon />}
            as={'a'}
            target={'_blank'}
            rel={'noopener noreferrer'}
            href={'https://github.com/Nekoya3/otoshidama'}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;
