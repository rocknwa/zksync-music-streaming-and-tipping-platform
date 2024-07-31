'use client';

import { useParams } from 'next/navigation';
import { ArtistPage } from '../../../components/ArtistPage';
import { ChakraProvider, Flex } from "@chakra-ui/react"
import { Sidebar } from '../../../components/Sidebar'


export default function ArtistPageWrapper() {
  const params = useParams();
  const id = params.id as string;

  if (!id) {
    return <div>Invalid artist ID</div>;
  }

  return (

  <ChakraProvider>
    <div className="flex flex-col h-screen bg-black text-white">
      <Flex h="100vh" flexDirection="column">
        <Flex flex="1" overflow="hidden">
          <Sidebar />
          <ArtistPage artistId={id} />       
          </Flex>
      </Flex>
    </div>
    </ChakraProvider>    
  )
}