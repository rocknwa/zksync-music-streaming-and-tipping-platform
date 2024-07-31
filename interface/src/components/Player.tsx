import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Image, Text, Icon, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react"
import { FaPlayCircle, FaPauseCircle, FaStepBackward, FaStepForward, FaVolumeMute, FaVolumeUp } from "react-icons/fa"

interface PlayerProps {
  audioUrl: string;
  title: string;
  artist: string;
  cover: string;
}

export function Player({ audioUrl, title, artist, cover }: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  return (
    <Flex h="90px" bg="black" borderTop="1px" borderColor="gray.800" alignItems="center" px={4}>
      <Flex w="30%" alignItems="center">
        <Image src={cover} alt="Album cover" w="60px" h="60px" mr={4} />
        <Box>
          <Text fontWeight="semibold">{title}</Text>
          <Text fontSize="sm" color="gray.400">{artist}</Text>
        </Box>
      </Flex>
      <Flex w="40%" flexDirection="column" alignItems="center">
        <Flex alignItems="center" mb={2}>
          <Icon as={FaStepBackward} boxSize={4} mx={4} cursor="pointer" />
          <Icon 
            as={isPlaying ? FaPauseCircle : FaPlayCircle} 
            boxSize={8} 
            cursor="pointer" 
            onClick={togglePlay}
          />
          <Icon as={FaStepForward} boxSize={4} mx={4} cursor="pointer" />
        </Flex>
        <Slider 
          aria-label="player-progress" 
          value={currentTime}
          onChange={handleSliderChange}
          min={0}
          max={duration || 100}
          w="100%"
        >
          <SliderTrack bg="gray.600">
            <SliderFilledTrack bg="green.500" />
          </SliderTrack>
          <SliderThumb boxSize={3} />
        </Slider>
      </Flex>
      <Flex w="30%" justifyContent="flex-end" alignItems="center" mr={5}>
        <Icon 
          as={isMuted ? FaVolumeMute : FaVolumeUp} 
          boxSize={4} 
          mr={2} 
          cursor="pointer"
          onClick={toggleMute}
        />
        <Slider 
          aria-label="volume" 
          value={isMuted ? 0 : volume} 
          onChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
          w="80px"
        >
          <SliderTrack bg="gray.600">
            <SliderFilledTrack bg="green.500" />
          </SliderTrack>
          <SliderThumb boxSize={3} />
        </Slider>
      </Flex>
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
      />
    </Flex>
  )
}