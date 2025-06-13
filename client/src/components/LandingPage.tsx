import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  keyframes
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { FaBrain, FaRobot, FaBookReader } from 'react-icons/fa';

// Animated components with framer-motion
const MotionBox = motion(Box);

// Animation for the floating effect
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

// Feature card component
interface FeatureCardProps {
  icon: React.ComponentType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Box 
    bg="whiteAlpha.100" 
    p={6} 
    rounded="xl" 
    boxShadow="lg" 
    borderWidth="1px" 
    borderColor="whiteAlpha.200"
    _hover={{ 
      transform: 'translateY(-5px)', 
      boxShadow: 'xl',
      borderColor: 'blue.400'
    }}
    transition="all 0.3s"
  >
    <Flex 
      w={12} 
      h={12} 
      align="center" 
      justify="center" 
      rounded="full" 
      bg="blue.500" 
      mb={4}
    >
      <Icon as={icon} fontSize="24px" color="white" />
    </Flex>
    <Heading as="h3" size="md" mb={2} color="white">
      {title}
    </Heading>
    <Text color="gray.400">
      {description}
    </Text>
  </Box>
);

interface LandingPageProps {
  onStartChat: () => void;
}

export default function LandingPage({ onStartChat }: LandingPageProps) {
  // Animation for the hero section
  const floatAnimation = `${float} 6s ease-in-out infinite`;
  
  return (
    <Box width="100%" maxWidth="100vw" minH="100vh" bg="gray.900">
      {/* Hero Section */}
      <Container maxW={{ base: "90%", md: "85%", lg: "80%" }} py={20} mx="auto">
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          align="center" 
          justify="center"
          gap={{ base: 8, md: 10 }}
          textAlign={{ base: 'center', md: 'left' }}
        >
          <Stack spacing={6} maxW={{ base: "100%", md: "600px" }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight="extrabold"
                lineHeight="1.2"
                bgGradient="linear(to-r, blue.400, purple.500, pink.400)"
                bgClip="text"
              >
                StudyByte AI
              </Heading>
              <Text
                mt={4}
                fontSize={{ base: 'xl', md: '2xl' }}
                color="gray.300"
                fontWeight="medium"
              >
                Your Intelligent Study Companion for Learning Anything
              </Text>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Text color="gray.400" fontSize="lg">
                Get instant answers, explanations, and assistance with any topic. 
                Our AI-powered study companion helps you learn more effectively.
              </Text>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              display="flex"
              justifyContent={{ base: 'center', md: 'flex-start' }}
            >
              <Button
                onClick={onStartChat}
                size="lg"
                px={8}
                py={7}
                colorScheme="blue"
                bg="blue.500"
                _hover={{ bg: "blue.400", transform: "translateY(-2px)" }}
                rightIcon={<ArrowForwardIcon />}
                boxShadow="0 10px 20px -8px rgba(66, 153, 225, 0.5)"
                transition="all 0.3s"
                fontWeight="bold"
                fontSize="lg"
              >
                Start Chatting
              </Button>
            </MotionBox>
          </Stack>
          
          <MotionBox
            animation={floatAnimation}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box
              w={{ base: '250px', sm: '300px', lg: '400px' }}
              h={{ base: '250px', sm: '300px', lg: '400px' }}
              bg="whiteAlpha.100"
              borderRadius="full"
              position="relative"
              overflow="hidden"
              boxShadow="0 0 100px rgba(66, 153, 225, 0.3)"
            >
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                borderRadius="full"
                bg="blue.500"
                opacity={0.2}
                w="80%"
                h="80%"
              />
              <Icon
                as={FaRobot}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w={{ base: '100px', sm: '120px', lg: '160px' }}
                h={{ base: '100px', sm: '120px', lg: '160px' }}
                color="blue.400"
              />
            </Box>
          </MotionBox>
        </Flex>
      </Container>
      
      {/* Features Section */}
      <Container maxW={{ base: "90%", md: "85%", lg: "80%" }} py={20} mx="auto">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          mb={12}
          textAlign="center"
        >
          <Heading
            as="h2"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            mb={4}
            color="white"
          >
            Why Choose StudyByte AI?
          </Heading>
          <Text color="gray.400" maxW="800px" mx="auto">
            Our intelligent study companion helps you learn faster and more effectively
          </Text>
        </MotionBox>
        
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={8}
          justify="center"
          align="stretch"
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            flex={1}
          >
            <FeatureCard
              icon={FaBrain}
              title="Intelligent Explanations"
              description="Get clear, concise explanations for complex topics tailored to your level of understanding."
            />
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            flex={1}
          >
            <FeatureCard
              icon={FaRobot}
              title="24/7 AI Assistant"
              description="Study anytime with our AI assistant that's always ready to help you learn and practice."
            />
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            flex={1}
          >
            <FeatureCard
              icon={FaBookReader}
              title="Custom Learning"
              description="Personalized learning experience that adapts to your pace and preferred learning style."
            />
          </MotionBox>
        </Flex>
      </Container>
      
      {/* CTA Section */}
      <Box bg="whiteAlpha.100" py={20} width="100%">
        <Container maxW={{ base: "90%", md: "85%", lg: "80%" }} textAlign="center" mx="auto">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Heading
              as="h2"
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="bold"
              mb={4}
              color="white"
            >
              Ready to Transform Your Learning?
            </Heading>
            <Text color="gray.400" maxW="600px" mx="auto" mb={8}>
              Start chatting with StudyByte AI and experience a smarter way to study
            </Text>
            <Button
              onClick={onStartChat}
              size="lg"
              px={8}
              colorScheme="blue"
              bg="blue.500"
              _hover={{ bg: "blue.400" }}
              rightIcon={<ArrowForwardIcon />}
              fontWeight="bold"
            >
              Start Chatting Now
            </Button>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
} 