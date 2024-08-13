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
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { ethers } from 'ethers';
import { useEthereum } from './Context';
import { FaGratipay } from "react-icons/fa6";
import { utils } from 'zksync-ethers';
import { paymasterParams } from './contract';

interface TipArtistProps {
  artistName: string;
  artistAddress: string;
}

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string memory)",
];

export function TipArtist({ artistName, artistAddress }: TipArtistProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tipAmount, setTipAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { account, getSigner, getProvider } = useEthereum();
  const [tipType, setTipType] = useState('ETH');

  const handleTip = async () => {
    if (!tipAmount || isNaN(Number(tipAmount))) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const provider = await getProvider();
      const signer = await getSigner();
      const gasPrice = await provider?.getGasPrice();
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

      if (tipType === 'ETH') {
        // estimate gasLimit via paymaster
        const gasLimit = await provider?.estimateGas({
          from: account.address,
          to: artistAddress,
          value: ethers.parseEther(tipAmount),
          customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
          },
      });

       // full overrides object including maxFeePerGas and maxPriorityFeePerGas
       const tx = {
        from: account.address,
        to: artistAddress,
        value: ethers.parseEther(tipAmount),
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        gasLimit: gasLimit,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      };
      const sentTx = await signer?.sendTransaction(tx);
      await sentTx?.wait();

      } else {
        if (!ethers.isAddress(tokenAddress)) {
          alert('Please enter a valid token address');
          setIsLoading(false);
          return;
        }
        const amount = ethers.parseEther(tipAmount);

        // Encode the transfer function call
        const data = tokenContract.interface.encodeFunctionData('transfer', [artistAddress, amount]);

        const gasLimit = await provider?.estimateGas({
          from: account.address,
          to: tokenAddress,
          data: data,
        });

        const tx = {
          from: account.address,
          to: tokenAddress,
          data: data,
          maxFeePerGas: gasPrice,
          maxPriorityFeePerGas: gasPrice,
          gasLimit: gasLimit,
          customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: paymasterParams,
          },
        };

        // Use the zkSync-compatible method to send the transaction
        const sentTx = await signer?.sendTransaction(tx);
        await sentTx?.wait();
      }
      const symbol = await tokenContract.symbol();

      alert(`Successfully tipped ${tipAmount} ${symbol} to ${artistName}`);
      onClose();
    } catch (error) {
      console.error('Error tipping artist:', error);
      alert('Error tipping artist. Please try again.');
    } finally {
      setIsLoading(false);
      setTipAmount('');
      setTokenAddress('');
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
              <FormControl>
                <FormLabel color="white">Select tip type:</FormLabel>
                <Select value={tipType} onChange={(e) => setTipType(e.target.value)} color="white">
                  <option value="ETH">ETH</option>
                  <option value="ERC20">Other ERC20 Token</option>
                </Select>
              </FormControl>
              {tipType === 'ERC20' && (
                <FormControl>
                  <FormLabel color="white">Token Contract Address:</FormLabel>
                  <Input 
                    placeholder="0x..." 
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    color="white"
                  />
                </FormControl>
              )}
              <FormControl>
                <FormLabel color="white">Enter the amount of {tipType === 'ETH' ? 'ETH' : 'tokens'} you want to tip:</FormLabel>
                <Input 
                  placeholder="0.1" 
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  type="number"
                  step="0.000001"
                  color="white"
                />
              </FormControl>
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