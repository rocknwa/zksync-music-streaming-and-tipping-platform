// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the SongNFT contract
import "./SongNFT.sol";

// Import the Ownable contract from OpenZeppelin
import "@openzeppelin/contracts/access/Ownable.sol";

// Define the main contract zkTune that inherits from Ownable
contract zkTune is Ownable {
    // Define a struct to represent an artist
    struct Artist {
        string name;       // Artist's name
        string profileURI; // URI to the artist's profile
    }

    // Define a struct to represent a user
    struct User {
        string name;       // User's name
        string profileURI; // URI to the user's profile
    }

    // Define a struct to represent a song
    struct Song {
        uint256 id;            // Song ID
        address artist;        // Address of the artist
        string title;          // Title of the song
        string audioURI;       // URI to the song's audio file
        string coverURI;       // URI to the song's cover image
        uint256 streamCount;   // Number of streams
        address songNFTAddress;// Address of the SongNFT contract
    }

    // Mapping from address to Artist struct
    mapping(address => Artist) public artists;
    // Mapping from address to User struct
    mapping(address => User) public users;
    // Mapping from song ID to Song struct
    mapping(uint256 => Song) public songs;
    // Nested mapping to check if a user has a specific song NFT
    mapping(uint256 => mapping(address => bool)) public userHasNFT;
    // Mapping from artist address to array of song IDs
    mapping(address => uint256[]) public artistSongs;
    // Mapping from user address to array of streamed song IDs
    mapping(address => uint256[]) public userStreams;
    // Mapping from artist ID to Artist struct
    mapping(uint256 => Artist) public artistID;

    // Array to store artist addresses
    address[] public artistAddresses;
    // Array to store song IDs
    uint256[] public songIds;
    // Private variable to track the current song ID
    uint256 private _currentSongId;
    // Private variable to track the current artist ID
    uint256 private _currentArtistId;
    // Public variable to track the total number of songs
    uint256 public totalSongs;
    // Public variable to track the total number of users
    uint256 public totalUsers;
    // Public variable to track the total number of artists
    uint256 public totalArtists;

    // Event emitted when an artist is registered
    event ArtistRegistered(address indexed artistAddress, string name);
    // Event emitted when a user is registered
    event UserRegistered(address indexed userAddress, string name);
    // Event emitted when a song is added
    event SongAdded(uint256 indexed songId, address indexed artist, string title);
    // Event emitted when a song is streamed
    event SongStreamed(uint256 indexed songId, address indexed listener);

    // Constructor to initialize state variables
    constructor() {
        _currentSongId = 0;  // Initialize current song ID to 0
        _currentArtistId = 0;// Initialize current artist ID to 0
        totalSongs = 0;      // Initialize total songs to 0
        totalUsers = 0;      // Initialize total users to 0
        totalArtists = 0;    // Initialize total artists to 0
    }

    // Modifier to check if the sender is a registered artist
    modifier onlyRegisteredArtist() {
        require(bytes(artists[msg.sender].name).length > 0, "Artist not registered");
        _; // Continue execution
    }

    // Modifier to check if a song exists
    modifier songExists(uint256 _songId) {
        require(songs[_songId].id != 0, "Song does not exist");
        _; // Continue execution
    }

    // Function to register a new artist
    // YOUR_CODE_GOES_HERE
    function registerArtist(string memory _name, string memory _profileURI) external {
        // Check if the artist is already registered

        // Increment current artist ID

        // Assign new artist ID

        // Store artist details in the artists mapping
        
        // Store artist details in the artistID mapping
        

        // Add artist address to the array

        // Increment total artists

        // Emit ArtistRegistered event
    }

    // Function to register a new user
    function registerUser(string memory _name, string memory _profileURI) external {
        // Check if the user is already registered
        require(bytes(users[msg.sender].name).length == 0, "User already registered");
        // Store user details in the users mapping
        users[msg.sender] = User(_name, _profileURI);
        totalUsers++; // Increment total users

        emit UserRegistered(msg.sender, _name); // Emit UserRegistered event
    }

    // Function to add a new song
    // YOUR_CODE_GOES_HERE
    function addSong(string memory _title, string memory _audioURI, string memory _coverURI, uint256 _nftPrice) external onlyRegisteredArtist {
        // Increment current song ID
        // Assign new song ID

        // Deploy a new SongNFT contract

        // Store song details in the songs mapping
        
        // Add song ID to the array

        // Add song ID to the artist's songs
        
        // Increment total songs

        // Emit SongAdded event
    }

    // Function to stream a song
    // YOUR_CODE_GOES_HERE
    function streamSong(uint256 _songId) external payable songExists(_songId) returns (string memory) {
        // Retrieve the song from the mapping
        
        // Retrieve the SongNFT contract

        
        // If the user already owns the NFT, return the audio URI
            
        // } else {
            // Mint a new NFT for the user
            
            // Mark that the user owns the NFT

            // Increment stream count
            // Add song ID to the user's streams

            // Emit SongStreamed event

            // Return the audio URI
            
        }

    // Function to get all songs
    function getAllSongs() external view returns (Song[] memory) {
        Song[] memory allSongs = new Song[](songIds.length); // Create an array of Song structs
        for (uint256 i = 0; i < songIds.length; i++) {
            allSongs[i] = songs[songIds[i]]; // Populate the array with songs
        }
        return allSongs; // Return the array
    }

    // Function to get all artists
    function getAllArtists() external view returns (Artist[] memory) {
        Artist[] memory allArtists = new Artist[](artistAddresses.length); // Create an array of Artist structs
        for (uint256 i = 0; i < artistAddresses.length; i++) {
            allArtists[i] = artists[artistAddresses[i]]; // Populate the array with artists
        }
        return allArtists; // Return the array
    }

    // Function to get songs by a specific artist
    function getSongsByArtist(address _artist) external view returns (Song[] memory) {
        uint256[] memory artistSongIds = artistSongs[_artist]; // Get the artist's song IDs
        Song[] memory artistSongsArray = new Song[](artistSongIds.length); // Create an array of Song structs

        for (uint256 i = 0; i < artistSongIds.length; i++) {
            artistSongsArray[i] = songs[artistSongIds[i]]; // Populate the array with the artist's songs
        }

        return artistSongsArray; // Return the array
    }

    // Function to get songs streamed by a specific user
    function getSongsStreamedByUser(address _user) external view returns (Song[] memory) {
        uint256[] memory userStreamedSongIds = userStreams[_user]; // Get the user's streamed song IDs
        Song[] memory userStreamedSongs = new Song[](userStreamedSongIds.length); // Create an array of Song structs

        for (uint256 i = 0; i < userStreamedSongIds.length; i++) {
            userStreamedSongs[i] = songs[userStreamedSongIds[i]]; // Populate the array with the user's streamed songs
        }

        return userStreamedSongs; // Return the array
    }
}
