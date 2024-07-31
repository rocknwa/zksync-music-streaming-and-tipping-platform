'use client';

import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, VStack, HStack, Image, Skeleton} from "@chakra-ui/react";
import { Contract } from 'zksync-ethers';
import { zkTunecontractconfig } from './contract';
import { useEthereum } from './Context';
import { usePlaySong } from './usePlaySong';
import { Player } from './Player';
import { TipArtist } from './TipArtist';



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

interface Artist {
    name: string;
    profileURI: string;
}


interface ArtistPageProps {
  artistId: string;
}

export function ArtistPage({ artistId }: ArtistPageProps) {
  const [artist, setArtist] = useState<Artist>();
  const [isLoading, setIsLoading] = useState(true);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [artistAddress, setArtistAddress] = useState("");
  const {account, getProvider} = useEthereum();
  const { playSong, currentSong, message } = usePlaySong();

  useEffect(() => {
    // Fetch artist data, top songs, and albums
    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        const provider = await getProvider();
        const contract = new Contract(zkTunecontractconfig.address, zkTunecontractconfig.abi, provider);
        const artistData = await contract.artistID(Number(artistId));
        const artistAddress = await contract.artistAddresses(Number(artistId) - 1);
        const artistSongs = await contract.getSongsByArtist(artistAddress);
        const formattedSongs = await Promise.all(artistSongs.map(async (song: any) => ({
            id: song[0].toString(),
            title: song[2],
            artist: (await contract.artists(song[1]))[0],
            cover: song[4],
            audioUrl: song[3],
            source: 'contract',
            streamCount: song[5],
            contractAddress: song[6]
          })));
        
        setArtistSongs(formattedSongs);
        setArtistAddress(artistAddress);
        setArtist({name: artistData[0], profileURI: artistData[1]});
      } catch (error) {
        console.error("Error fetching artist data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  if (isLoading) {
    return <Skeleton height="100vh" />;
  }

  return (
    <Box flex="1" bg="gray.800" color="white" overflowY="auto" p={8}>
    <Box bg="gray.900" color="white" height="100vh" p={8}>
      <Flex direction="column">
        {/* Artist Header */}
        <Flex align="center" mb={8}>
        <Skeleton isLoaded={!isLoading}>
          <Image 
            src={artist?.profileURI} 
            alt={artist?.name}
            boxSize="200px"
            objectFit="cover"
            mr={6}
            borderRadius="full"
          />
        </Skeleton>
          <VStack align="flex-start" spacing={2}>
          <Skeleton isLoaded={!isLoading}>
            <Heading size="3xl">{artist?.name}</Heading>
            </Skeleton>
            <Skeleton isLoaded={!isLoading}>
                <TipArtist artistName={artist?.name || ''} artistAddress={artistAddress} />
              </Skeleton>
          </VStack>
        </Flex>

        {/* Songs */}
        <Box mb={12}>
        <Skeleton isLoaded={!isLoading}>
          <Heading size="lg" mb={4}>Popular</Heading>
          </Skeleton>
          <VStack align="stretch" spacing={2}>
          <Skeleton isLoaded={!isLoading}>
            {artistSongs.slice(0, 5).map((song, index) => (
              <HStack key={song.id} 
                p={2} 
                _hover={{ bg: "gray.700" }} 
                borderRadius="md"
                cursor="pointer"
                onClick={() => playSong(song)}>
                <Text width="24px">{index + 1}</Text>
                <Image src={song.cover} alt={song.title} boxSize="40px" mr={4} />
                <Text flex={1}>{song.title}</Text>
                <Text color="gray.400">{song.streamCount.toLocaleString()} plays</Text>
              </HStack>
            ))}
            </Skeleton>
          </VStack>
          <Box position="fixed" bottom={0} left={0} right={0}>
                <Player 
                  audioUrl={currentSong?.audioUrl || ""} 
                  title={message ? message : currentSong?.title || ""} 
                  artist={currentSong?.artist || ""} 
                  cover={currentSong?.cover ||"https://via.placeholder.com/300"}
                />
              </Box>
        </Box>
      </Flex>
    </Box>
    </Box>
  );
}