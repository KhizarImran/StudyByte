import { ChakraProvider, ColorModeScript, Box } from '@chakra-ui/react';
import { useState } from 'react';
import Chat from './components/Chat';
import LandingPage from './components/LandingPage';
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        margin: 0,
        padding: 0,
        width: '100vw',
        overflowX: 'hidden'
      }
    }
  }
});

export default function App() {
    const [showChat, setShowChat] = useState(false);
    
    const handleStartChat = () => {
        setShowChat(true);
    };
    
    const handleBackToHome = () => {
        setShowChat(false);
    };
    
    return (
        <>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <ChakraProvider theme={theme}>
                {showChat ? (
                    <Chat onBackClick={handleBackToHome} />
                ) : (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      width="100%"
                      minHeight="100vh"
                    >
                        <LandingPage onStartChat={handleStartChat} />
                    </Box>
                )}
            </ChakraProvider>
        </>
    );
}
