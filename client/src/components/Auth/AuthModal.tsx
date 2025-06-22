import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  Spinner,
  Center
} from '@chakra-ui/react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { useAuth } from '../../hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'signup'
  onAuthSuccess?: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login',
  onAuthSuccess 
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode)
  const { loading } = useAuth()

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  const handleForgotPassword = () => {
    setMode('forgot')
  }

  const handleBackToLogin = () => {
    setMode('login')
  }

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="gray.800" borderRadius="xl">
          <ModalBody p={8}>
            <Center>
              <VStack spacing={4}>
                <Spinner size="lg" color="blue.500" />
                <Box color="gray.300">Loading...</Box>
              </VStack>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg="transparent" boxShadow="none">
        <ModalCloseButton
          color="white"
          bg="whiteAlpha.200"
          _hover={{ bg: "whiteAlpha.300" }}
          zIndex="modal"
        />
        <ModalBody p={0}>
          {mode === 'login' && (
            <LoginForm 
              onToggleMode={handleToggleMode}
              onForgotPassword={handleForgotPassword}
            />
          )}
          {mode === 'signup' && (
            <SignUpForm 
              onToggleMode={handleToggleMode}
            />
          )}
          {mode === 'forgot' && (
            <ForgotPasswordForm 
              onBackToLogin={handleBackToLogin}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

// Simple forgot password form
const ForgotPasswordForm: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await resetPassword(email)
      // Show success message
    } catch (error) {
      // Handle error
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
        <Box
          fontSize="2xl"
          fontWeight="bold"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
        >
          Reset Password
        </Box>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <Box w="full">
              <Box color="gray.300" mb={2}>Email</Box>
              <Box
                as="input"
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                placeholder="Enter your email"
                w="full"
                p={3}
                bg="gray.700"
                border="none"
                borderRadius="md"
                color="white"
                _focus={{
                  bg: "gray.600",
                  outline: "none",
                  boxShadow: "0 0 0 2px #3182ce"
                }}
              />
            </Box>

            <Box
              as="button"
              type="submit"
              w="full"
              p={3}
              bg="blue.500"
              color="white"
              borderRadius="md"
              fontWeight="medium"
              _hover={{ bg: "blue.400", transform: "translateY(-2px)" }}
              _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Box>
          </VStack>
        </form>

        <Box
          color="blue.400"
          cursor="pointer"
          onClick={onBackToLogin}
          _hover={{ textDecoration: 'underline' }}
        >
          Back to login
        </Box>
      </VStack>
    </Box>
  )
} 