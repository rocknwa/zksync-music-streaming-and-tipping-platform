'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Box, Flex, Heading, Text, HStack, SimpleGrid, Image, Button, Skeleton, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, Progress, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Input, VStack, FormControl, FormLabel, InputGroup, NumberInput, Checkbox, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import { useProfileData } from './fetchProfile';
import { FaPlay, FaUser, FaHeadphones, FaPlus, FaMusic, FaImage, FaUpload } from 'react-icons/fa';
import { useIPFS } from './uploadIPFS'; 
import { useAddSong } from './AddSong';

// Define the Song type
interface Song {
  id: string;
  title: string;
  artist?: string;
  cover: string;
  streamCount?: number;
}

interface NewSong {
  title: string;
  audioFile: File | null;
  coverFile: File | null;
  isFree: boolean;
  nftPrice: string;
}

// Define props for SongGrid component
interface SongGridProps {
  songs: Song[];
  title: string;
  onAddSong?: () => void; 
}

const SongGrid: React.FC<SongGridProps> = ({ songs, title, onAddSong }) => (
  <Box>
    <Heading size="lg" mb={6}>{title}</Heading>
    <SimpleGrid columns={[2, 3, 4, 5]} spacing={6}>
      {songs.map((song) => (
        <Box key={song.id} bg="gray.800" borderRadius="lg" overflow="hidden" transition="all 0.3s" _hover={{ transform: "scale(1.05)" }}>
          <Box position="relative">
            <Image src={song.cover} alt={song.title} />
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              right="0" 
              bottom="0" 
              bg="blackAlpha.600" 
              opacity="0" 
              transition="all 0.3s" 
              _groupHover={{ opacity: 1 }} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Icon as={FaPlay} color="white" boxSize={8} />
            </Box>
          </Box>
          <Box p={4}>
            <Text fontWeight="semibold" isTruncated>{song.title}</Text>
            <Text fontSize="sm" color="gray.400" isTruncated>{song.artist || `Stream Count: ${song.streamCount}`}</Text>
          </Box>
        </Box>
      ))}
      {onAddSong && (
        <Box 
          bg="gray.800" 
          borderRadius="lg" 
          overflow="hidden" 
          transition="all 0.3s" 
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
          onClick={onAddSong}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Icon as={FaPlus} color="white" boxSize={12} />
        </Box>
      )}
    </SimpleGrid>
  </Box>
);

export function Profile() {
  const {isLoading, isArtist, artistInfo, artistSongs, streamedNFTs, totalStreams, error, userInfo, fetchProfileData } = useProfileData();
  const [isMounted, setIsMounted] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newSong, setNewSong] = useState<NewSong>({ title: '', audioFile: null, coverFile: null, isFree: true, nftPrice: '0'  });
  const {uploadToIPFS, isUploading, error: uploadError } = useIPFS();
  const { addSong, isAdding } = useAddSong({
    onSongAdded: () => {
      fetchProfileData();
      onClose();
      setNewSong({ title: '', audioFile: null, coverFile: null, isFree: true, nftPrice: '0' });
    },
    onError: (error) => alert(error)
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
    if (event.target.files && event.target.files[0]) {
      setNewSong({ ...newSong, [`${type}File`]: event.target.files[0] });
    }
  };

  const handleAddSong = async () => {
    if (!newSong.title || !newSong.audioFile || !newSong.coverFile) {
      alert('Please fill in all fields and upload both audio and cover image.');
      return;
    }

    try {
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setUploadProgress(0);
      const audioUrl = await uploadToIPFS(newSong.audioFile);
      setUploadProgress(50);
      const coverUrl = await uploadToIPFS(newSong.coverFile);
      setUploadProgress(100);

      await addSong(
        newSong.title,
        audioUrl,
        coverUrl,
        newSong.isFree ? '0' : newSong.nftPrice
      );
    } catch (error) {
      console.error('Error adding song:', error);
      alert('An error occurred while adding the song. Please try again.');
    } finally {
      setUploadProgress(0);
    }
  };

  if (!isMounted) {
    return null 
  }

  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box flex="1" bg="gray.900" color="white" overflowY="auto" minH="100vh">
      <Box 
        bg="gray.900"
        p={10}
      >
        <Skeleton isLoaded={!isLoading}>
        </Skeleton>
        <Flex alignItems="center" mt={8}>
          <Box 
            position="relative" 
            borderRadius="full" 
            overflow="hidden"
            w="150px"  
            h="150px"
            boxShadow="lg"
            mr={8}
          >
          <Skeleton isLoaded={!isLoading}>
            <Image 
              src={isArtist ? artistInfo?.profileURI : userInfo?.profileURI}
              alt={isArtist ? artistInfo?.name : userInfo?.name}
              objectFit="cover"
              w="100%"
              h="100%"
            />
            </Skeleton>
          </Box>
          <Skeleton isLoaded={!isLoading}>
            <Heading size="4xl" mb={2}>{isArtist ? artistInfo?.name : userInfo?.name }</Heading>
            <HStack>
            <Box>
            <Text fontSize='s'>{isArtist && `${artistSongs.length} songs ` }</Text>
            </Box>
            <Box>
            <Text fontSize='s'>{isArtist && `${totalStreams} listeners`}</Text>
            </Box>
            </HStack>
            </Skeleton>
        </Flex>
      </Box>
      
      <Box p={8}>
      <Skeleton isLoaded={!isLoading}>
        <Tabs colorScheme="green" mb={8}>
          <TabList>
            <Tab><Icon as={FaHeadphones} mr={2} /> Streamed Songs</Tab>
            {isArtist && <Tab><Icon as={FaUser} mr={2} /> Your Songs</Tab>}
          </TabList>
          <TabPanels>
            <TabPanel>
            <Skeleton isLoaded={!isLoading}>
              <SongGrid songs={streamedNFTs} title="Streamed Songs" />
              </Skeleton>
            </TabPanel>
            {isArtist && (
              <TabPanel>
                <Skeleton isLoaded={!isLoading}>
                <SongGrid songs={artistSongs} title="Your Songs" onAddSong={onOpen} />
                </Skeleton>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
        </Skeleton>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" justifyContent="center">
        <ModalHeader>Add New Song</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel>Song Title</FormLabel>
              <Input 
                placeholder="Enter song title" 
                value={newSong.title}
                onChange={(e) => setNewSong({...newSong, title: e.target.value})}
              />
            </FormControl>

            <HStack width="100%" spacing={4}>
              <Box flex={1}>
                <FormControl>
                  <FormLabel>Audio File</FormLabel>
                  <Box 
                    border="2px dashed" 
                    borderColor="gray.500" 
                    borderRadius="md" 
                    p={4} 
                    textAlign="center"
                    cursor="pointer"
                    alignContent="center"
                    height="200px"
                    width="150px"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    {newSong.audioFile ? (
                      <Text>{newSong.audioFile.name}</Text>
                    ) : (
                      <VStack>
                        <Icon as={FaMusic} boxSize={8} />
                        <Text>Click to upload audio</Text>
                      </VStack>
                    )}
                  </Box>
                  <Input 
                    type="file" 
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, 'audio')}
                    ref={audioInputRef}
                    display="none"
                  />
                </FormControl>
              </Box>

              <Box flex={1}>
                <FormControl>
                  <FormLabel>Cover Image</FormLabel>
                  <Box 
                    border="2px dashed" 
                    borderColor="gray.500" 
                    borderRadius="md" 
                    p={4} 
                    textAlign="center"
                    cursor="pointer"
                    onClick={() => coverInputRef.current?.click()}
                    alignContent="center"
                    height="200px" 
                    width="350px"                   
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {newSong.coverFile ? (
                      <Image 
                        src={URL.createObjectURL(newSong.coverFile)} 
                        alt="Cover preview" 
                        maxHeight="100%" 
                        maxWidth="100%" 
                        objectFit="contain"
                      />
                    ) : (
                      <VStack>
                        <Icon as={FaImage} boxSize={8} />
                        <Text>Click to upload cover</Text>
                      </VStack>
                    )}
                  </Box>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    ref={coverInputRef}
                    display="none"
                  />
                </FormControl>
              </Box>
            </HStack>

            <FormControl>
              <Checkbox 
                isChecked={newSong.isFree}
                onChange={(e) => setNewSong({...newSong, isFree: e.target.checked, nftPrice: e.target.checked ? '0' : newSong.nftPrice})}
              >
                Free Song
              </Checkbox>
            </FormControl>

            {!newSong.isFree && (
              <FormControl>
                <FormLabel>NFT Price (ETH)</FormLabel>
                <NumberInput 
                  value={newSong.nftPrice} 
                  onChange={(valueString) => setNewSong({...newSong, nftPrice: valueString})}
                  min={0} 
                  step={0.01}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="white"/>
                    <NumberDecrementStepper color="white" />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            )}

            {isUploading && (
              <Box width="100%">
                <Text mb={2}>Uploading: {uploadProgress}%</Text>
                <Progress value={uploadProgress} size="sm" colorScheme="green" />
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button variant="outline" colorScheme="green" mr={3} onClick={handleAddSong} isLoading={isAdding} leftIcon={<FaUpload />}>
            Add Song
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </Box>
  );
}