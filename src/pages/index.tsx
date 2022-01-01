import type { NextPage } from 'next';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { TwitterIcon } from '~/components/icons/TwitterIcon';
import { GitHubIcon } from '~/components/icons/GitHubIcon';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

const Home: NextPage = () => {
  const [toAddress, setToAddress] = useState('');
  const [sendAmount, setSendAmount] = useState(0);
  const [isMetaMask, setIsMetaMask] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [chainId, setChainId] = useState<number>(0);
  const [senderAddress, setSenderAddress] = useState('');
  const [isSenderUsedENS, setIsSenderUsedENS] = useState(false);
  const [senderBalance, setSenderBalance] = useState(0);
  const toast = useToast();
  const router = useRouter();
  const ChainList: {
    [key: number]: {
      chainName: string;
      tokenAddress: string;
    };
  } = {
    1: {
      chainName: 'Ethereum',
      tokenAddress: '0x2370f9d504c7a6e775bf6e14b3f12846b594cd53',
    },
    100: {
      chainName: 'xDAI',
      tokenAddress: '0x417602f4fbdd471a431ae29fb5fe0a681964c11b',
    },
    137: {
      chainName: 'Polygon',
      tokenAddress: '0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c',
    },
  };

  useEffect(() => {
    // @ts-ignore
    setIsMetaMask(Boolean(window.ethereum && window.ethereum.isMetaMask));
  }, []);
  const getChainObjectFromChainId = (chainId: number): string | undefined => {
    if (ChainList[chainId]) {
      return ChainList[chainId].chainName;
    }
    return undefined;
  };
  const getTokenAddressFromChainId = (chainId: number): string | undefined => {
    if (ChainList[chainId]) {
      return ChainList[chainId].tokenAddress;
    }
    return undefined;
  };
  const sendJPYC = async (address: string, amount: number) => {
    if (isMetaMask) {
      setIsWalletLoading(true);
      // @ts-ignore
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      try {
        const { chainId } = await provider.getNetwork();
        const ABI = [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
          'function transfer(address to, uint amount) returns (bool)',
          'event Transfer(address indexed from, address indexed to, uint amount)',
        ];
        const signer = provider.getSigner();
        const senderAddress = await signer.getAddress();
        const tokenAddress = getTokenAddressFromChainId(chainId);
        if (tokenAddress) {
          const contract = new ethers.Contract(tokenAddress, ABI, signer);
          const decimals = await contract.decimals();
          const tx = await contract.transfer(address, parseUnits(String(amount), 18));
          await tx.wait();
          const contractRO = new ethers.Contract(tokenAddress, ABI, provider);
          const balance = await contractRO.balanceOf(senderAddress);
          if (decimals !== 18) {
            toast({
              title: '何らかの問題が発生した可能性があります。',
              description: 'Code: 18',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'bottom-right',
            });
          }
          setSenderBalance(Number(formatUnits(balance, decimals)));
          router.reload();
        } else {
          toast({
            title: '未対応のネットワークの可能性があります。',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom-right',
          });
        }
        setIsWalletLoading(false);
      } catch (e) {
        console.log(e);
        toast({
          title: '何らかの問題が発生した可能性があります。',
          description: 'ENS名を使用している場合使用せずにお試しください。',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    }
  };
  const onClickConnectWallet = async () => {
    if (isMetaMask) {
      setIsWalletLoading(true);
      // @ts-ignore
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      try {
        await provider.send('eth_requestAccounts', []);
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
        const { chainId } = await provider.getNetwork();
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
      try {
        const ABI = [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
          'function transfer(address to, uint amount) returns (bool)',
          'event Transfer(address indexed from, address indexed to, uint amount)',
        ];
        const { chainId } = await provider.getNetwork();
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const tokenAddress = getTokenAddressFromChainId(chainId);
        if (tokenAddress) {
          console.log(tokenAddress);
          const readOnlyContract = new ethers.Contract(tokenAddress, ABI, provider);
          const decimals = await readOnlyContract.decimals();

          const balance = await readOnlyContract.balanceOf(address);
          if (decimals !== 18) {
            toast({
              title: '何らかの問題が発生した可能性があります。',
              description: 'Code: 18',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'bottom-right',
            });
          }
          setSenderBalance(Number(formatUnits(balance, decimals)));
        } else {
          toast({
            title: '未対応のネットワークの可能性があります。',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom-right',
          });
        }
        setIsWalletLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    return () => {
      if (chainId !== 0) {
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
            <Flex
              alignItems={'center'}
              rounded={'md'}
              backgroundColor={'gray.50'}
              gap={2}
              pl={3}
              pr={1}
            >
              <Text fontWeight={'600'}>{Math.round(senderBalance * 100000) / 100000} JPYC</Text>
              <Button size={'sm'}>
                {isSenderUsedENS ? senderAddress : senderAddress.slice(0, 12)}
              </Button>
            </Flex>
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
          disabled={!senderAddress || !senderAddress.length || isWalletLoading}
          value={toAddress}
          onChange={(event) => {
            setToAddress(event.target.value);
          }}
        />
        <Flex flexDirection={'column'} gap={1}>
          <InputGroup>
            <NumberInput
              placeholder={'包む金額'}
              disabled={!senderAddress || !senderAddress.length || isWalletLoading}
              value={sendAmount}
              min={0}
              max={senderBalance}
              onChange={(_, inputAmount) => {
                if (inputAmount) {
                  setSendAmount(inputAmount);
                } else {
                  setSendAmount(0);
                }
              }}
            >
              <NumberInputField roundedEnd={0} />
            </NumberInput>
            <InputRightAddon>JPYC</InputRightAddon>
          </InputGroup>
          {!senderAddress || !senderAddress.length || isWalletLoading ? (
            <Flex height={'1.5rem'} />
          ) : (
            <Flex justifyContent={'space-between'}>
              <Text fontSize={'sm'}>残高: {senderBalance} JPYC</Text>
              <Button
                h="1.5rem"
                size="sm"
                onClick={() => {
                  setSendAmount(senderBalance);
                }}
              >
                max
              </Button>
            </Flex>
          )}
        </Flex>
        <Button
          colorScheme={'teal'}
          disabled={
            !senderAddress ||
            !senderAddress.length ||
            isWalletLoading ||
            !toAddress ||
            !toAddress.length ||
            !sendAmount
          }
          isLoading={isWalletLoading}
          onClick={() => {
            sendJPYC(toAddress, sendAmount);
          }}
        >
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
        <Button
          size={'sm'}
          variant={'transparent'}
          onClick={() => {
            setToAddress('0x76D378627AC7a5F42418355418F28af08D6051B0');
          }}
        >
          ɴᴇᴋᴏʏᴀsᴀɴに送る
        </Button>
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
