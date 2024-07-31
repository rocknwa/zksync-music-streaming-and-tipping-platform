import { useState } from 'react';
import { useEthereum } from './Context';
import { Contract, utils } from 'zksync-ethers';
import { zkTunecontractconfig, paymasterParams } from './contract';
import { ethers } from 'ethers';

interface AddSongProps {
  onSongAdded: () => void;
  onError: (error: string) => void;
}

export function useAddSong({ onSongAdded, onError }: AddSongProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { getSigner, getProvider, account } = useEthereum();

  const addSong = async (title: string, audioURI: string, coverURI: string, nftPrice: string) => {
    setIsAdding(true);
    try {
      const provider = await getProvider();
      const signer = await getSigner();
      const gasPrice = await provider?.getGasPrice();
      const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, signer);

       // estimate gasLimit via paymaster
       const gasLimit = await contract.addSong.estimateGas(title, audioURI, coverURI, ethers.parseEther(nftPrice), {
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

      const tx = await contract.addSong(
        title,
        audioURI,
        coverURI,
        ethers.parseEther(nftPrice),
        txOverrides
      );

      await tx.wait();
      onSongAdded();
    } catch (error) {
      console.error('Error adding song:', error);
      onError('An error occurred while adding the song. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return { addSong, isAdding };
}