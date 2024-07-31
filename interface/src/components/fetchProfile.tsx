import React, { useEffect, useState } from 'react';
import { Contract } from 'zksync-ethers';
import { useEthereum } from './Context';
import { zkTunecontractconfig } from './contract';

interface Artist {
    name: string;
    profileURI: string;
  }

interface User {
    name: string;
    profileURI: string;
  }

interface Song {
    id: string;
    title: string;
    artist: string;
    cover: string;
    audioUrl: string;
    streamCount: number;
    contractAddress: string;
  }

export function useProfileData() {
    const [isLoading, setIsLoading] = useState(true);
    const { account, getSigner } = useEthereum();
    const [isArtist, setIsArtist] = useState(false);
    const [artistInfo, setArtistInfo] = useState<Artist | null>(null);
    const [userInfo, setUserInfo] = useState<Artist | null>(null);
    const [artistSongs, setArtistSongs] = useState<Song[]>([]);
    const [streamedNFTs, setStreamedNFTs] = useState<Song[]>([]);
    const [totalStreams, setTotalStreams] = useState(0);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
        fetchProfileData();
    }, [account.address, getSigner]);

        const fetchProfileData = async () => {
            try {
              const signer = await getSigner();
              const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, signer);
      
              // Check if user is an artist
              const artistData = await contract.artists(account.address);
              if (artistData[0] !== '') {
                setIsArtist(true);
                setArtistInfo({ name: artistData[0], profileURI: artistData[1] });

                console.log('fetched artist songs')
      
                // Fetch artist's songs
                let totalStreams = 0;
                const artistSongs = await contract.getSongsByArtist(account.address);
                const songs = await Promise.all(artistSongs.map(async (song: any) => {
                    const streamCount = Number(song[5]);
                    totalStreams += streamCount;
                    return {
                        id: song[0].toString(),
                        title: song[2],
                        artist: (await contract.artists(song[1]))[0],
                        cover: song[4],
                        audioUrl: song[3],
                        source: 'contract',
                        streamCount: streamCount,
                        contractAddress: song[6]
                    };
                }));
                setArtistSongs(songs);
                setTotalStreams(totalStreams);
            } else {
                setIsArtist(false);
                const userData = await contract.users(account.address);
                setUserInfo({ name: userData[0], profileURI: userData[1] });
            }

                // Fetch streamed NFTs 
                const streamedNFTs = await contract.getSongsStreamedByUser(account.address);
                const nfts = await Promise.all(streamedNFTs.map(async (nft: any) => ({
                    id: nft[0].toString(),
                    title: nft[2],
                    artist: (await contract.artists(nft[1]))[0],
                    cover: nft[4],
                    audioUrl: nft[3],
                    source: 'contract',
                    streamCount: nft[5],
                    contractAddress: nft[6]
                })))
                setStreamedNFTs(nfts);
              
            } catch (err) {
              setError("Failed to load profile data");
              console.error(err);
            } finally {
              setIsLoading(false);
            }
          };
        
    return { isLoading, isArtist, artistInfo, artistSongs, streamedNFTs, totalStreams, error, userInfo, fetchProfileData };
  }