import React, { useState } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  useDisclosure,
  VStack,
  Text,
  Icon,
} from "@chakra-ui/react";
import { ethers } from 'ethers';
import { useEthereum } from './Context';
import { FaGratipay } from "react-icons/fa6";


interface TipArtistProps {
  artistName: string;
  artistAddress: string;
}

export function TipArtist({ artistName, artistAddress }: TipArtistProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tipAmount, setTipAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { account, getSigner, getProvider } = useEthereum();


  const handleTip = async () => {
    if (!tipAmount || isNaN(Number(tipAmount))) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const signer = await getSigner();

      const tx = await signer?.sendTransaction({
        // The user's active address.
        from: account.address,
        // Required except during contract publications.
        to: artistAddress,
        // Only required to send ether to the recipient from the initiating external account.
        value: ethers.parseEther(tipAmount),
      })

      tx?.wait();

      alert(`Successfully tipped ${tipAmount} ETH to ${artistName}`);
      onClose();
    } catch (error) {
      console.error('Error tipping artist:', error);
      alert('Error tipping artist. Please try again.');
    } finally {
      setIsLoading(false);
      setTipAmount('');
    }
  };

  return (
    <>
      <Button leftIcon={<Icon as={FaGratipay} />} onClick={onOpen} colorScheme="pink" variant="outline">Support Artist</Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.900">
          <DrawerCloseButton />
          <DrawerHeader color="white">Tip {artistName}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              <Text color="white">Enter the amount of ETH you want to tip:</Text>
              <Input 
                placeholder="0.1" 
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                type="number"
                step="0.01"
                color="white"
              />
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button colorScheme='red' variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleTip} isLoading={isLoading}>
              Send Tip
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}