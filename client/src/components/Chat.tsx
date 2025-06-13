import { Box, Flex, Heading, Text, useToast, Input, Button, Icon, IconButton } from '@chakra-ui/react';
import { ArrowRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import MessageList from './MessageList';
import { Message } from '../types/chat';

// UI Components
const ChatHeader = ({ onBackClick }: { onBackClick?: () => void }) => (
  <Flex direction="column" align="center" mb={2} position="relative" w="full">
    {onBackClick && (
      <IconButton
        aria-label="Back to home"
        icon={<ChevronLeftIcon />}
        position="absolute"
        left={0}
        top="50%"
        transform="translateY(-50%)"
        variant="ghost"
        color="whiteAlpha.700"
        _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
        onClick={onBackClick}
      />
    )}
    <Heading
      size="xl"
      bgGradient="linear(to-r, blue.400, purple.500)"
      bgClip="text"
      fontWeight="extrabold"
      letterSpacing="tight"
    >
      StudyByte AI
    </Heading>
    <Text color="whiteAlpha.600" fontSize="sm" mt={1}>
      Your Intelligent Study Companion
    </Text>
  </Flex>
);

// Send Button Component
const SendButton = ({ isLoading }: { isLoading: boolean }) => (
  <Button
    type="submit"
    colorScheme="blue"
    size="lg"
    isLoading={isLoading}
    loadingText=""
    display="flex"
    alignItems="center"
    justifyContent="center"
    width="48px"
    height="48px"
    minW="48px"
    borderRadius="full"
    bg="blue.500"
    _hover={{
      bg: "blue.400",
      transform: "translateY(-2px)",
      boxShadow: "lg",
      '& svg': { transform: 'translateX(3px)' }
    }}
    _active={{
      bg: "blue.600",
      transform: "translateY(0)"
    }}
    transition="all 0.2s"
    position="relative"
  >
    <Box
      position="relative"
      width="24px"
      height="24px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {!isLoading && (
        <Icon 
          as={ArrowRightIcon} 
          boxSize={6} 
          color="white"
          transition="transform 0.2s"
          fontWeight="bold"
        />
      )}
    </Box>
  </Button>
);

interface ChatProps {
  onBackClick?: () => void;
}

export default function Chat({ onBackClick }: ChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Create a new message
  const createMessage = useCallback((role: 'user' | 'assistant', content: string, isThinking = false): Message => ({
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    role,
    content,
    timestamp: new Date(),
    isThinking
  }), []);

  // Add a message to the state
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Update the last assistant message
  const updateLastMessage = useCallback((content: string, isThinking = false) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = content;
        lastMessage.isThinking = isThinking;
      }
      return newMessages;
    });
  }, []);

  // Handle message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    
    // Add user message
    const userMessage = createMessage('user', trimmedInput);
    addMessage(userMessage);
    
    // Add initial assistant message
    const assistantMessage = createMessage('assistant', 'Thinking...', true);
    addMessage(assistantMessage);
    
    // Clear input and set loading state
    setInput('');
    setIsLoading(true);

    try {
      // Send message and handle streaming response
      await chatService.sendMessageStream(
        trimmedInput,
        (_, __, fullContent) => {
          updateLastMessage(fullContent, false);
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error toast
      toast({
        title: 'Error',
        description: 'Failed to get response from the AI. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      // Update message with error
      updateLastMessage('Error: Failed to get response', false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      w="100vw" 
      h="100vh" 
      bg="gray.900" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
    >
      <Box 
        w="full" 
        maxW="1200px" 
        h="90vh" 
        mx="auto" 
        bg="gray.800" 
        borderRadius="xl" 
        boxShadow="2xl"
        p={6}
      >
        <Flex direction="column" h="full" gap={6}>
          <ChatHeader onBackClick={onBackClick} />
          
          {/* Messages Area */}
          <Box 
            flex="1" 
            overflowY="auto" 
            css={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { width: '6px', background: 'gray.700' },
              '&::-webkit-scrollbar-thumb': { background: 'gray.600', borderRadius: '24px' },
            }}
          >
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input Form */}
          <Box as="form" onSubmit={handleSendMessage} borderTopWidth="1px" borderColor="whiteAlpha.200" p={4}>
            <Flex gap={4}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                size="lg"
                bg="gray.700"
                border="none"
                color="white"
                _focus={{ boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)", border: "none" }}
                _hover={{ bg: "gray.600" }}
                isDisabled={isLoading}
              />
              <SendButton isLoading={isLoading} />
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
} 