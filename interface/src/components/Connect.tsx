'use client'

import { useState, useRef, useEffect } from 'react';
import { useEthereum } from './Context';
import { useIPFS } from './uploadIPFS'; 
import { 
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton, 
  useDisclosure, 
  Input, 
  VStack, 
  Text,
  Image,
  Box,
  Icon,
  IconButton
} from "@chakra-ui/react"
import { Contract, utils } from 'zksync-ethers';
import { zkTunecontractconfig, paymasterParams } from './contract';
import { IoMdCloudUpload, IoMdTrash } from "react-icons/io";


export function Connect() {
  const { account, connect, disconnect, getSigner, getProvider, switchNetwork } = useEthereum();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { uploadToIPFS, isUploading, error: uploadError } = useIPFS();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    console.log('Connect');
    await switchNetwork(300)
    await connect();
    setIsConnecting(false);

  };

  useEffect(()  =>{
    const checkUser = async() => {
      try {
        console.log('Checking user');
        const signer = await getSigner();
        const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, signer);
        const user = await contract.users(signer?.address);
        const artist = await contract.artists(signer?.address);
        if (artist[0] == '' && user[0] == '') {
          onOpen();
        }else if (artist[0] !== '') {
          console.log('Connected as artist');
        }else {
          console.log('Connected as listener');
        } 
    } catch(e) {
        await disconnect();
    }
  }
    checkUser();

  }, [isConnecting])

  const checkRegistration = async() => {
    try {
      console.log('Checking Registration');
      const signer = await getSigner();
      const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, signer);
      const user = await contract.users(signer?.address);
      const artist = await contract.artists(signer?.address);
      if (artist[0] == '' && user[0] == '') {
        onOpen();
      }else if (artist[0] !== '') {
        console.log('Connected as artist');
      }else {
        console.log('Connected as listener');
      } 
  } catch(e) {
      await disconnect();
  }
    finally{
      onClose();
    }
}

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleRegistration = async (isArtist: boolean) => {
    setIsLoading(true);
    let profileURI = '';
    if (file) {
      try {
        profileURI = await uploadToIPFS(file, `${name || 'User'}_profile`);
      } catch (error) {
        console.error('Error uploading file:', error);
        return;
      }
    }

    try {
      const signer = await getSigner();
      const provider = await getProvider();
      const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, signer);

      if (isArtist) {

        const gasPrice = await provider?.getGasPrice();

        // estimate gasLimit via paymaster
        const gasLimit = await contract.registerArtist.estimateGas(name, profileURI, {
          from: account.address,
          customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
          },
      });

        // full overrides object including maxFeePerGas and maxPriorityFeePerGas
        const txOverrides = {
          maxFeePerGas: gasPrice,
          maxPriorityFeePerGas: "0",
          gasLimit,
          customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
          }
      }

        const tx = await contract.registerArtist(name, '' || profileURI, txOverrides)
        tx.wait(2);

        console.log("Registered as artist");
        checkRegistration();
        
      } else {
        const gasPrice = await provider?.getGasPrice();

        console.log(profileURI);

        // estimate gasLimit via paymaster
        const gasLimit = await contract.registerUser.estimateGas(name, profileURI, {
          from: account.address,
          customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
          },
      });

        // full overrides object including maxFeePerGas and maxPriorityFeePerGas
        const txOverrides = {
          maxFeePerGas: gasPrice,
          maxPriorityFeePerGas: "0",
          gasLimit,
          customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
          }
      }

        const tx = await contract.registerUser(name, '' || profileURI, txOverrides)
        tx.wait(2);
        console.log("Registered as regular user");
        checkRegistration();
      }
    } catch (error) {
      console.error("Error registering:", error);
    }
    setIsLoading(false);
    onClose();
  };

  console.log(account.isConnected);

  return (
    <>
      {account.isConnected ? (
        <Button colorScheme="red" size="md" borderRadius="full" onClick={disconnect}>
          Disconnect wallet
        </Button>
      ) : (
        <Button 
          colorScheme="green" 
          size="md" 
          borderRadius="full" 
          onClick={handleConnect}
        >
          Connect wallet
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay  backgroundColor="rgba(0, 0, 0, 0.6)" />
        <ModalContent bg="gray.900">
          <ModalHeader color="white" textAlign="center">Complete Your Profile</ModalHeader>
          <ModalCloseButton color="white" _hover={{color: "red"}} border="solid" borderRadius="full" onClick={() => disconnect()}/>
          <ModalBody >
            <VStack spacing={4}>
            <Box
              borderRadius="full"
              border="2px dashed"
              borderColor="gray.300"
              w="100px"
              h="100px"
              display="flex"
              justifyContent="center"
              color="white"
              alignItems="center"
              position="relative"
              overflow="hidden"
              _hover={{
                color: "green",
                borderColor: "green",
                '& > .delete-icon': {
                  opacity: 1,
                }
              }}
            >
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                display="none"
              />
              {file ? (
                <>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Profile preview"
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                  <IconButton
                    aria-label="Delete image"
                    icon={<IoMdTrash />}
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    backgroundColor="rgba(0, 0, 0, 0.6)"
                    color="white"
                    size="sm"
                    borderRadius="full"
                    opacity={0}
                    transition="opacity 0.2s"
                    className="delete-icon"
                    onClick={() => setFile(null)}
                  />
                </>
              ) : (
                <Icon
                  as={IoMdCloudUpload}
                  boxSize={6}
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                />
              )}
            </Box>
              <Input 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                textColor="white"
                _hover={{
                  borderColor: "green",
                }}
              />
              {uploadError && <Text color="red.500">{uploadError}</Text>}
            </VStack>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => handleRegistration(true)}
              isLoading={isloading}
              textColor="white"
              _hover={{
                borderColor: "blue",
                border: "solid"
              }}
              
            >
              Register as Artist
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => handleRegistration(false)}
              isLoading={isloading}
              textColor="white"
              _hover={{
                borderColor: "blue",
                border: "solid"
              }}
              
            >
              Register as Listener
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}