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

interface LoginFormProps {
  onToggleMode: () => void
  onForgotPassword: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onToggleMode, 
  onForgotPassword 
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in.',
          status: 'success',
          duration: 3000,
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
          Welcome Back
        </Text>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
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
                  placeholder="Enter your password"
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

            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="Signing in..."
              _hover={{ transform: 'translateY(-2px)' }}
            >
              Sign In
            </Button>
          </VStack>
        </form>

        <Text
          color="blue.400"
          cursor="pointer"
          onClick={onForgotPassword}
          _hover={{ textDecoration: 'underline' }}
        >
          Forgot your password?
        </Text>

        <Divider />

        <Text color="gray.400">
          Don't have an account?{' '}
          <Link
            color="blue.400"
            onClick={onToggleMode}
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
          >
            Sign up
          </Link>
        </Text>
      </VStack>
    </Box>
  )
} 