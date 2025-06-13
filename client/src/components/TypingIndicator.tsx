import { Box, Flex, keyframes, usePrefersReducedMotion } from '@chakra-ui/react';

// Simplified animation definition
const blink = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
`;

// Simple dot component to avoid repetition
const Dot = ({ delay = 0 }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const animation = prefersReducedMotion 
    ? undefined 
    : `${blink} 1.4s ${delay}s infinite ease-in-out`;
  
  return (
    <Box 
      as="span" 
      w="8px" 
      h="8px" 
      borderRadius="full" 
      bg="gray.300" 
      mx="1px"
      animation={animation}
    />
  );
};

export default function TypingIndicator() {
  return (
    <Flex alignItems="center" h="24px">
      <Dot delay={0} />
      <Dot delay={0.2} />
      <Dot delay={0.4} />
    </Flex>
  );
} 