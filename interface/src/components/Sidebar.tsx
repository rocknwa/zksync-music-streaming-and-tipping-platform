import { Box, VStack, Text, Button, Icon, Image } from "@chakra-ui/react"
import { FaHome} from "react-icons/fa"
import { CgProfile } from "react-icons/cg";
import { useRouter } from 'next/navigation';
import { Connect } from '../components/Connect'


export function Sidebar() {
  const router = useRouter();
  return (
    <Box w="240px" bg="black" color="gray.300" p={4}>
      <VStack align="stretch" spacing={6}>
      <Image
          src='https://silver-blushing-woodpecker-143.mypinata.cloud/ipfs/QmUqP59HgmiDdmUhfEndZM3JFDk9ZT6rH6U9hxaXwPy77X'
          alt='zkTune'
        />
        <VStack align="stretch" spacing={4}>
        <Box position="relative" >
          <Connect />
          </Box>
          <Button leftIcon={<Icon as={FaHome} />} variant="ghost" justifyContent="flex-start" colorScheme='green' onClick={() => router.push('/')}>
            Home
          </Button>
          <Button leftIcon={<Icon as={CgProfile} />} variant="ghost" justifyContent="flex-start" colorScheme='green' onClick={() => router.push('/profile')}>
            Profile
          </Button>
          {/* <Button leftIcon={<Icon as={FaSearch} />} variant="ghost" justifyContent="flex-start">
            Search
          </Button>
          <Button leftIcon={<Icon as={FaBook} />} variant="ghost" justifyContent="flex-start">
            Your Library
          </Button>
        </VStack>
        <VStack align="stretch" spacing={4}>
          <Button leftIcon={<Icon as={FaPlusSquare} />} variant="ghost" justifyContent="flex-start">
            Create Playlist
          </Button>
          <Button leftIcon={<Icon as={FaHeart} />} variant="ghost" justifyContent="flex-start">
            Liked Songs
          </Button> */}
        </VStack>
      </VStack>
    </Box>
  )
}