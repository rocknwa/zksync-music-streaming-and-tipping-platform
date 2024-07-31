'use client'

import dynamic from 'next/dynamic'
import { Sidebar } from '../../components/Sidebar'
import { ChakraProvider, Flex } from "@chakra-ui/react"


const ProfileComponent = dynamic(() => import('../../components/Profile').then(mod => mod.Profile), {
  ssr: false,
  loading: () => <p>Loading...</p>
})


export default function ProfilePage() {
  return (
<ChakraProvider>
    <div className="flex flex-col h-screen bg-black text-white">
      <Flex h="100vh" flexDirection="column">
        <Flex flex="1" overflow="hidden">
          <Sidebar />
          <ProfileComponent />        
          </Flex>
      </Flex>
    </div>
    </ChakraProvider>    

  )
}