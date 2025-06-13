import { Box, Flex, Text, keyframes, usePrefersReducedMotion } from '@chakra-ui/react';
import { Message } from '../types/chat';
import MarkdownRenderer from './MarkdownRenderer';
import TypingIndicator from './TypingIndicator';

// Define the pulsing animation
const pulseKeyframes = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

interface MessageListProps {
    messages: Message[];
}

// Message style constants
const messageStyles = {
    user: {
        align: 'flex-end',
        bg: 'blue.500',
    },
    assistant: {
        align: 'flex-start',
        bg: 'whiteAlpha.200',
        markdownStyles: {
            ul: { paddingLeft: '1.5rem', marginBottom: '1rem' },
            ol: { paddingLeft: '1.5rem', marginBottom: '1rem' },
            li: { marginBottom: '0.25rem' },
            blockquote: { 
                borderLeftWidth: '4px', 
                borderLeftColor: 'blue.400',
                paddingLeft: '1rem',
                fontStyle: 'italic',
                marginY: '1rem'
            },
            hr: { marginY: '1rem' }
        }
    }
};

// Message content component to handle role-specific rendering
const MessageContent = ({ message }: { message: Message }) => {
    if (message.role === 'user') {
        return <Text>{message.content}</Text>;
    }
    
    if (message.isThinking) {
        return (
            <Flex direction="column" gap={2}>
                <Text fontStyle="italic" color="gray.300">{message.content}</Text>
                <TypingIndicator />
            </Flex>
        );
    }
    
    return <MarkdownRenderer content={message.content} />;
};

export default function MessageList({ messages }: MessageListProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const pulseAnimation = prefersReducedMotion
        ? undefined
        : `${pulseKeyframes} 1.5s ease-in-out infinite`;

    return (
        <Flex direction="column" gap={4}>
            {messages.map((message) => {
                const styles = messageStyles[message.role];
                
                return (
                    <Box
                        key={message.id}
                        alignSelf={styles.align}
                        maxW="70%"
                        bg={styles.bg}
                        color="white"
                        p={4}
                        borderRadius="lg"
                        boxShadow="md"
                        animation={message.isThinking ? pulseAnimation : undefined}
                    >
                        <Box sx={message.role === 'assistant' ? messageStyles.assistant.markdownStyles : undefined}>
                            <MessageContent message={message} />
                        </Box>
                        
                        <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </Text>
                    </Box>
                );
            })}
        </Flex>
    );
} 