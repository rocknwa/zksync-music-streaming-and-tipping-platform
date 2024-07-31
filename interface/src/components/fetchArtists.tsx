'use client'

import { useState, useEffect } from 'react';
import { zkTunecontractconfig } from './contract';
import { Contract } from 'zksync-ethers';
import { useEthereum } from './Context';

interface Artist {
    id: string;
    name: string;
    profileURI: string;
}

export function useFetchArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getProvider } = useEthereum();

  useEffect(() => {
    async function fetchArtists() {
      try {
        setLoading(true);
        const provider = await getProvider();
        const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, provider);
        
        const fetchedArtists = await contract.getAllArtists();
        console.log(fetchedArtists);
        const formattedArtists = await Promise.all(fetchedArtists.map(async (artist: any, index: number) => ({
          id: (index + 1).toString(),
          name: artist[0],
          profileURI: artist[1],
        })));
        
        setArtists(formattedArtists);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching artists'));
      } finally {
        setLoading(false);
      }
    }

    fetchArtists();
  }, [getProvider]);

  return { artists, loading, error };
}