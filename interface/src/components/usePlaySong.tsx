import { useState, useEffect } from 'react';
import { useEthereum } from './Context';
import SongNFTABI from "../ABI/SongNFT.json";
import { Contract, utils } from 'zksync-ethers';
import { zkTunecontractconfig, paymasterParams } from './contract';
import { ethers } from "ethers";


interface Song {
    id: string
    title: string
    artist: string
    cover: string
    audioUrl: string
    streamCount: number
    contractAddress: string
}

export const usePlaySong = () => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [message, setMessage] = useState("");
    const {account, getSigner, getProvider } = useEthereum();

    useEffect(() => {
        if(account.isConnected === false) {
            setCurrentSong(null);
        }
      },[account.isConnected]);

    const mintNFT = async (song: Song) => {
        const provider = await getProvider();
        const signer = await getSigner();
        const gasPrice = await provider?.getGasPrice();
        const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, signer);
        const SongNFTContract = new Contract(song.contractAddress, SongNFTABI.abi, signer);
        const nftPrice = await SongNFTContract.nftPrice();

         // estimate gasLimit via paymaster
         const gasLimit = await contract.streamSong.estimateGas(song.id, {
            from: account.address,
            value: ethers.parseEther(nftPrice.toString()),
            customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: paymasterParams,
            },
        });

         // full overrides object including maxFeePerGas and maxPriorityFeePerGas
        const txOverrides = {
            value: ethers.parseEther(nftPrice.toString()),
            maxFeePerGas: gasPrice,
            maxPriorityFeePerGas: "0",
            gasLimit,
            customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams,
            }
        }

        const tx = await contract.streamSong(song.id, txOverrides)
        tx.wait(2);
    };

    const playSong = async (song: Song) => {
        setMessage("Putting the record on...");
        const signer = await getSigner();
        const SongNFTContract = new Contract(song.contractAddress, SongNFTABI.abi, signer);
        const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, signer);
        
        if (await SongNFTContract.balanceOf(account.address?.toString()) > 0) {
            console.log("NFT Minted already")
            const songData = await SongNFTContract.getInfo(account.address?.toString())
            const currentSong = {
                id: songData[0].toString(),
                title: await SongNFTContract.name(),
                artist: (await contract.artists(songData[1]))[0],
                cover: songData[3],
                audioUrl: songData[2],
                source: 'contract',
                streamCount: 0,
                contractAddress: ""
            }
            setMessage("");
            setCurrentSong(currentSong);
        } else {
            setMessage("Minting Song")
            console.log("Minting Song");
            await mintNFT(song);
            
            const checkForMintedNFT = async (attempts = 5) => {
                if (attempts === 0) {
                    console.error("NFT minting timeout. Please check your transaction.");
                    return;
                }
                setMessage("Putting the record on...")
                if (await SongNFTContract.balanceOf(account.address?.toString()) > 0) {
                    console.log("NFT Minted successfully");
                    const songData = await SongNFTContract.getInfo(account.address?.toString());
                    const currentSong = {
                        id: songData[0].toString(),
                        title: await SongNFTContract.name(),
                        artist: (await contract.artists(songData[1]))[0],
                        cover: songData[3],
                        audioUrl: songData[2],
                        source: 'contract',
                        streamCount: 0,
                        contractAddress: ""
                    }
                    setMessage("");
                    setCurrentSong(currentSong);
                } else {
                    console.log(`Waiting for NFT to be minted. Attempts left: ${attempts}`);
                    setTimeout(() => checkForMintedNFT(attempts - 1), 2000);
                }
            };
    
            checkForMintedNFT();
        }
    };

    return { playSong, currentSong, message };
};