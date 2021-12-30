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
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { TwitterIcon } from '~/components/icons/TwitterIcon';
import { GitHubIcon } from '~/components/icons/GitHubIcon';
import type { Provider } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const [toAddress, setToAddress] = useState('');
  const [sendAmount, setSendAmount] = useState(0);
  const [isMetaMask, setIsMetaMask] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [etherProvider, setEtherProvider] = useState<Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number>(0);
  const [senderAddress, setSenderAddress] = useState('');
  const [isSenderUsedENS, setIsSenderUsedENS] = useState(false);
  const toast = useToast();
  const router = useRouter();
  useEffect(() => {
    // @ts-ignore
    setIsMetaMask(Boolean(window.ethereum && window.ethereum.isMetaMask));
  }, []);
  const getChainObjectFromChainId = (chainId: number): string | undefined => {
    const ChainList: {
      [key: number]: {
        chainName: string;
      };
    } = {
      1: {
        chainName: 'Ethereum',
      },
      137: {
        chainName: 'Polygon',
      },
    };
    if (ChainList[chainId]) {
      return ChainList[chainId].chainName;
    }
    return undefined;
  };
  const onClickConnectWallet = async () => {
    if (isMetaMask) {
      setIsWalletLoading(true);
      // @ts-ignore
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      try {
        await provider.send('eth_requestAccounts', []);
        setEtherProvider(provider);
      } catch (e) {
        console.error(e);
        toast({
          title: 'お財布との接続に失敗しました。',
          description: 'MetaMaskがインストールされているかをご確認の上再度お試しください。',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
      try {
        const { chainId } = await provider.getNetwork();
        setChainId(chainId);
        // @ts-ignore
        window.ethereum.on('chainChanged', async (_) => {
          router.reload();
        });
      } catch (e) {
        console.error(e);
        toast({
          title: 'ネットワークの取得に失敗しました。',
          description:
            '正しいネットワークが選択されているか、正しくお財布と接続されているかを確認してください。',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
      try {
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setSenderAddress(address);
        if (chainId === 1) {
          const ens = await provider.lookupAddress(address);
          // Null when ENS is not used
          if (ens) {
            setSenderAddress(ens);
            setIsSenderUsedENS(true);
          }
        }
        setIsWalletLoading(false);
      } catch (e) {
        console.error(e);
        toast({
          title: 'アカウントの取得に失敗しました。',
          description: '正しくお財布と接続されているかを確認してください。',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    }
    return () => {
      if (etherProvider) {
        // @ts-ignore
        window.ethereum.off('chainChanged');
      }
    };
  };

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
        {senderAddress ? (
          <Flex gap={2}>
            <Button>
              {getChainObjectFromChainId(chainId)
                ? getChainObjectFromChainId(chainId)
                : 'サポートしていないネットワークです'}
            </Button>
            <Button>{isSenderUsedENS ? senderAddress : senderAddress.slice(0, 12)}</Button>
          </Flex>
        ) : (
          <Button
            disabled={!isMetaMask}
            isLoading={isWalletLoading}
            onClick={() => {
              onClickConnectWallet();
            }}
          >
            お財布につなぐ
          </Button>
        )}
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
          disabled={!senderAddress || !senderAddress.length}
          value={toAddress}
          onChange={(event) => {
            setToAddress(event.target.value);
          }}
        />
        <InputGroup>
          <InputLeftAddon>&yen;</InputLeftAddon>
          <NumberInput
            placeholder={'包む金額'}
            disabled={!senderAddress || !senderAddress.length}
            value={sendAmount}
            onChange={(_, inputAmount) => {
              setSendAmount(inputAmount);
            }}
          >
            <NumberInputField roundedStart={0} />
          </NumberInput>
        </InputGroup>
        <Button colorScheme={'teal'} disabled={!senderAddress || !senderAddress.length}>
          お金をつつんで送る
        </Button>
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
