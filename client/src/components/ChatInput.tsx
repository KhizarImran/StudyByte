import { 
    Box, 
    Button, 
    Input, 
    InputGroup, 
    InputRightElement,
    Spinner
} from '@chakra-ui/react';
import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box>
            <InputGroup size="lg">
                <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    bg="whiteAlpha.100"
                    border="none"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    _focus={{ 
                        bg: 'whiteAlpha.200',
                        borderColor: 'blue.300'
                    }}
                    color="white"
                    disabled={isLoading}
                />
                <InputRightElement width="4.5rem">
                    {isLoading ? (
                        <Spinner size="sm" color="blue.200" />
                    ) : (
                        <Button
                            h="1.75rem"
                            size="sm"
                            onClick={handleSend}
                            colorScheme="blue"
                            isDisabled={!message.trim()}
                        >
                            Send
                        </Button>
                    )}
                </InputRightElement>
            </InputGroup>
        </Box>
    );
} 