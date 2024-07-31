'use client'

import { useState, useEffect } from 'react';
import { zkTunecontractconfig } from './contract';
import { Contract } from 'zksync-ethers';
import { useEthereum } from './Context';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  source: string;
  streamCount: number;
  contractAddress: string;
}

export function useFetchSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getProvider } = useEthereum();

  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);
        const provider = await getProvider();
        const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, provider);
        
        const fetchedSongs = await contract.getAllSongs();
        console.log(fetchedSongs);
        const formattedSongs = await Promise.all(fetchedSongs.map(async (song: any) => ({
          id: song[0].toString(),
          title: song[2],
          artist: (await contract.artists(song[1]))[0],
          cover: song[4],
          audioUrl: song[3],
          source: 'contract',
          streamCount: song[5],
          contractAddress: song[6]
        })));
        
        setSongs(formattedSongs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching songs'));
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, [getProvider]);

  return { songs, loading, error };
}