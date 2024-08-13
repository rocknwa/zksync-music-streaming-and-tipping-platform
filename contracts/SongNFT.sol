// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// An extension of the ERC721 standard to manage token URIs.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Provides basic access control mechanisms, allowing only the owner to execute certain functions.
import "@openzeppelin/contracts/access/Ownable.sol";
// Provides safe mathematical operations to prevent overflow and underflow errors.
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// SongNFT contract declaration
contract SongNFT is ERC721URIStorage, Ownable {
    // Importing SafeMath library
    using SafeMath for uint256;

    // Tracks the current token ID
    uint256 private _currentTokenId;
    // Price of the NFT
    uint256 public nftPrice;
    // Address of the artist
    address public artist;
    // URI of the audio file
    string public audioURI;
    // Accumulated royalties
    uint256 public royaltyBalance;
    // URI of the cover image
    string public coverURI;

    // Defining the struct NFTInfo to store comprehensive information of the NFT
    struct NFTInfo {
        uint256 nftPrice;           // Price of the NFT
        address artist;             // Address of the artist
        string audioURI;            // URI of the audio file
        string coverURI;            // URI of the cover image
        uint256 royaltyBalance;     // Balance of royalties
        uint256 currentTokenId;     // Current token ID
    } 

    // Declaring a constant representing the royalty percentage (30%) on NFT minting
    uint256 public constant ROYALTY_PERCENTAGE = 30;

    // Triggered when a new NFT is minted
    event NFTMinted(uint256 indexed tokenId, address indexed buyer, uint256 price);
    // Triggered when royalties are collected
    event RoyaltyCollected(uint256 indexed tokenId, uint256 amount);
    // Triggered when royalties are paid out to the artist
    event RoyaltyPaid(address indexed artist, uint256 amount);

    // The modifier restricts function access to users who own at least one NFT
    modifier onlyMintedUser(address user) {
        require(YOUR_CODE_GOES_HERE > 0,"Don't own the NFT"); // ASSIGNMENT #1
        _;
    }

    // The constructor will initialize the state variables using the input parameters
    constructor(string memory _name, string memory _symbol, uint256 _nftPrice, 
    string memory _audioURI, address _artist, string memory _coverURI) ERC721(_name, _symbol) {
        // Initialize the state variables using the input parameters
        // Fill in with appropriate parameters | ASSIGNMENT #2
        nftPrice = YOUR_CODE_GOES_HERE; 
        audioURI = YOUR_CODE_GOES_HERE; 
        coverURI = YOUR_CODE_GOES_HERE; 
        artist = YOUR_CODE_GOES_HERE;
        _currentTokenId = 0;
    }

    // Mint the new NFT
    function mintNFT(address _to) external payable returns (uint256) {
		// Ensures the payment is sufficient using the NFT price
        // Fill in with appropriate variable | ASSIGNMENT #3
        require(msg.value >= YOUR_CODE_GOES_HERE, "Insufficient payment"); 

		// Increment the token ID and save it to newTokenId here
        YOUR_CODE_GOES_HERE // ASSIGNMENT #4
        uint256 newTokenId = _currentTokenId;

		// Calculate the royalty amount
        uint256 royaltyAmount = msg.value.mul(ROYALTY_PERCENTAGE).div(100);
        
        // Update the royalty balance
        royaltyBalance = royaltyBalance.add(royaltyAmount);

		// Safely mints the new token
        _safeMint(_to, newTokenId);
        
        // Sets the token URI
        _setTokenURI(newTokenId, audioURI);

        // Emits an event for royalty collection
        emit YOUR_CODE_GOES_HERE(newTokenId, royaltyAmount); // Fill in with appropriate event | ASSIGNMENT #5
        // Emits an event for NFT minting
        emit YOUR_CODE_GOES_HERE(newTokenId, _to, msg.value); // Fill in with appropriate event | ASSIGNMENT #6

		//  Return the new token ID
        return YOUR_CODE_GOES_HERE; // Fill in with appropriate variable | ASSIGNMENT #7
    }

    // payRoyalties function pays out the accumulated royalties to the artist
    function payRoyalties() external {
		// Retrieves the royalty balance
        uint256 amount = royaltyBalance;
        // Reset the royalty balance
        royaltyBalance = YOUR_CODE_GOES_HERE; // Fill in with appropriate number | ASSIGNMENT #8

		// Transfers the royalty amount to the artist
        (bool success, ) = payable(artist).call{value: amount}("");
        // Ensures the transfer was successful
        require(YOUR_CODE_GOES_HERE, "Royalty payout failed"); // Fill in with appropriate variable | ASSIGNMENT #9

		// Emits an event for royalty payment
        emit YOUR_CODE_GOES_HERE(artist, amount); // Fill in with appropriate event | ASSIGNMENT #10
    }

    // Retrieves comprehensive information about the NFT
    function getInfo(address user) external view onlyMintedUser(user) returns (NFTInfo memory)  {
		// Returns an NFTInfo struct with detailed information.
        return NFTInfo({
            // Initializing the NFTInfo fields here using the state variables
            // Fill in with appropriate state variable | ASSIGNMENT #11
            nftPrice: nftPrice, 
            artist: YOUR_CODE_GOES_HERE,
            audioURI: YOUR_CODE_GOES_HERE,
            coverURI: YOUR_CODE_GOES_HERE, 
            royaltyBalance: YOUR_CODE_GOES_HERE,
            currentTokenId: YOUR_CODE_GOES_HERE 
        });
    }
}