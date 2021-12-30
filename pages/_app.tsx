import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import 'focus-visible/dist/focus-visible';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
