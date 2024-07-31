// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SongNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract zkTune is Ownable {
    struct Artist {
        string name;
        string profileURI;
    }

    struct User {
        string name;
        string profileURI;
    }

    struct Song {
        uint256 id;
        address artist;
        string title;
        string audioURI;
        string coverURI;
        uint256 streamCount;
        address songNFTAddress;
    }

    mapping(address => Artist) public artists;
    mapping(address => User) public users;
    mapping(uint256 => Song) public songs;
    mapping(uint256 => mapping(address => bool)) public userHasNFT;
    mapping(address => uint256[]) public artistSongs;
    mapping(address => uint256[]) public userStreams;
    mapping(uint256 => Artist) public artistID;

    address[] public artistAddresses;
    uint256[] public songIds;
    uint256 private _currentSongId;
    uint256 private _currentArtistId;
    uint256 public totalSongs;
    uint256 public totalUsers;
    uint256 public totalArtists;


    event ArtistRegistered(address indexed artistAddress, string name);
    event UserRegistered(address indexed userAddress, string name);
    event SongAdded(uint256 indexed songId, address indexed artist, string title);
    event SongStreamed(uint256 indexed songId, address indexed listener);

    constructor() {
        _currentSongId = 0;
        _currentArtistId = 0;
        totalSongs = 0;
        totalUsers = 0;
        totalArtists = 0;
    }

    modifier onlyRegisteredArtist() {
        require(bytes(artists[msg.sender].name).length > 0, "Artist not registered");
        _;
    }

    modifier songExists(uint256 _songId) {
        require(songs[_songId].id != 0, "Song does not exist");
        _;
    }

    function registerArtist(string memory _name, string memory _profileURI) external {
        require(bytes(artists[msg.sender].name).length == 0, "Artist already registered");
        _currentArtistId++;
        uint256 newArtistId = _currentArtistId;

        artists[msg.sender] = Artist(_name, _profileURI);
        artistID[newArtistId] = Artist(_name, _profileURI);

        artistAddresses.push(msg.sender);
        totalArtists++;

        emit ArtistRegistered(msg.sender, _name);
    }

    function registerUser(string memory _name, string memory _profileURI) external {
        require(bytes(users[msg.sender].name).length == 0, "User already registered");
        users[msg.sender] = User(_name, _profileURI);
        totalUsers++;
        emit UserRegistered(msg.sender, _name);
    }

    function addSong(string memory _title, string memory _audioURI, string memory _coverURI, uint256 _nftPrice) external onlyRegisteredArtist {
        _currentSongId++;
        uint256 newSongId = _currentSongId;

        // Deploy a new SongNFT contract
        SongNFT songNFT = new SongNFT(_title, "ZKT", _nftPrice, _audioURI, msg.sender, _coverURI);

        songs[newSongId] = Song(newSongId, msg.sender, _title, _audioURI, _coverURI, 0, address(songNFT));
        songIds.push(newSongId);

        artistSongs[msg.sender].push(newSongId);
        totalSongs++;

        emit SongAdded(newSongId, msg.sender, _title);
    }

    function streamSong(uint256 _songId) external payable songExists(_songId) returns (string memory) {
        Song storage song = songs[_songId];
        SongNFT songNFT = SongNFT(song.songNFTAddress);

        if (userHasNFT[_songId][msg.sender]) {
            // User already owns the NFT, return the audio URI
            return song.audioURI;
        } else {
            // Mint a new NFT for the user
            songNFT.mintNFT{value: msg.value}(msg.sender);
            userHasNFT[_songId][msg.sender] = true;

            // Increment stream count
            song.streamCount++;

            //Add the song to user stream list
            userStreams[msg.sender].push(_songId);

            emit SongStreamed(_songId, msg.sender);

            // Return the audio URI
            return song.audioURI;
        }
    }

    function getAllSongs() external view returns (Song[] memory) {
        Song[] memory allSongs = new Song[](songIds.length);
        for (uint256 i = 0; i < songIds.length; i++) {
            allSongs[i] = songs[songIds[i]];
        }
        return allSongs;
    }

    function getAllArtists() external view returns (Artist[] memory) {
        Artist[] memory allArtists = new Artist[](artistAddresses.length);
        for (uint256 i = 0; i < artistAddresses.length; i++) {
            allArtists[i] = artists[artistAddresses[i]];
        }
        return allArtists;
    }

    function getSongsByArtist(address _artist) external view returns (Song[] memory) {
        uint256[] memory artistSongIds = artistSongs[_artist];
        Song[] memory artistSongsArray = new Song[](artistSongIds.length);

        for (uint256 i = 0; i < artistSongIds.length; i++) {
            artistSongsArray[i] = songs[artistSongIds[i]];
        }

        return artistSongsArray;
    }

    function getSongsStreamedByUser(address _user) external view returns (Song[] memory) {
        uint256[] memory userStreamedSongIds = userStreams[_user];
        Song[] memory userStreamedSongs = new Song[](userStreamedSongIds.length);

        for (uint256 i = 0; i < userStreamedSongIds.length; i++) {
            userStreamedSongs[i] = songs[userStreamedSongIds[i]];
        }

        return userStreamedSongs;
    }
}
