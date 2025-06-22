import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  Link
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useAuth } from '../../hooks/useAuth'

interface SignUpFormProps {
  onToggleMode: () => void
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password)
      
      if (error) {
        toast({
          title: 'Sign Up Failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Check your email!',
          description: 'We sent you a confirmation link to complete your registration.',
          status: 'success',
          duration: 8000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      w="full"
      maxW="md"
      bg="gray.800"
      p={8}
      borderRadius="xl"
      boxShadow="2xl"
      borderWidth="1px"
      borderColor="gray.600"
    >
      <VStack spacing={6}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
        >
          Create Account
        </Text>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color="gray.300">Full Name</FormLabel>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                bg="gray.700"
                border="none"
                _focus={{
                  bg: "gray.600",
                  boxShadow: "0 0 0 2px #3182ce"
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="gray.300">Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                bg="gray.700"
                border="none"
                _focus={{
                  bg: "gray.600",
                  boxShadow: "0 0 0 2px #3182ce"
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="gray.300">Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  bg="gray.700"
                  border="none"
                  _focus={{
                    bg: "gray.600",
                    boxShadow: "0 0 0 2px #3182ce"
                  }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="gray.300">Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  bg="gray.700"
                  border="none"
                  _focus={{
                    bg: "gray.600",
                    boxShadow: "0 0 0 2px #3182ce"
                  }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="Creating account..."
              _hover={{ transform: 'translateY(-2px)' }}
            >
              Create Account
            </Button>
          </VStack>
        </form>

        <Divider />

        <Text color="gray.400">
          Already have an account?{' '}
          <Link
            color="blue.400"
            onClick={onToggleMode}
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
          >
            Sign in
          </Link>
        </Text>
      </VStack>
    </Box>
  )
} 