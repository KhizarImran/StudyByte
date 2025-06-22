import React from 'react'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Avatar,
  Text,
  HStack,
  useToast,
  Box
} from '@chakra-ui/react'
import { ChevronDownIcon, SettingsIcon } from '@chakra-ui/icons'
import { useAuth } from '../hooks/useAuth'

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth()
  const toast = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: 'Signed out successfully',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
      })
    }
  }

  if (!user) return null

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        bg="gray.700"
        color="white"
        _hover={{ bg: 'gray.600' }}
        _active={{ bg: 'gray.600' }}
        border="1px"
        borderColor="gray.600"
      >
        <HStack spacing={2}>
          <Avatar size="sm" name={user.email} />
          <Box textAlign="left">
            <Text fontSize="sm" fontWeight="medium">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </Text>
          </Box>
        </HStack>
      </MenuButton>
      
      <MenuList bg="gray.800" borderColor="gray.600">
        <MenuItem
          bg="gray.800"
          _hover={{ bg: 'gray.700' }}
          color="white"
          icon={<SettingsIcon />}
        >
          Profile Settings
        </MenuItem>
        
        <MenuDivider />
        
        <MenuItem
          bg="gray.800"
          _hover={{ bg: 'gray.700' }}
          color="red.300"
          onClick={handleSignOut}
        >
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  )
} 