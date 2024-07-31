// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// An extension of the ERC721 standard to manage token URIs.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Provides basic access control mechanisms, allowing only the owner to execute certain functions.
import "@openzeppelin/contracts/access/Ownable.sol";
// Provides safe mathematical operations to prevent overflow and underflow errors.
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SongNFT is ERC721URIStorage, Ownable {
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

    struct NFTInfo {
        uint256 nftPrice;
        address artist;
        string audioURI;
        string coverURI;
        uint256 royaltyBalance;
        uint256 currentTokenId;
    } 

    uint256 public constant ROYALTY_PERCENTAGE = 30; // 30% royalty on NFT minting 

    // Triggered when a new NFT is minted
    event NFTMinted(uint256 indexed tokenId, address indexed buyer, uint256 price);
    // Triggered when royalties are collected
    event RoyaltyCollected(uint256 indexed tokenId, uint256 amount);
    // Triggered when royalties are paid out to the artist
    event RoyaltyPaid(address indexed artist, uint256 amount);

    modifier onlyMintedUser(address user) {
        require(balanceOf(user) > 0, "Don't own the NFT");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 _nftPrice, string memory _audioURI, address _artist, string memory _coverURI) ERC721(_name, _symbol) {
        nftPrice = _nftPrice;
        audioURI = _audioURI;
        coverURI = _coverURI;
        artist = _artist;
        _currentTokenId = 0;
    }

    function mintNFT(address _to) external payable returns (uint256) {
		    // Ensures the payment is sufficient.
        require(msg.value >= nftPrice, "Insufficient payment");

				// Increments the token ID
        _currentTokenId++;
        uint256 newTokenId = _currentTokenId;

				// Calculates the royalty amount
        uint256 royaltyAmount = msg.value.mul(ROYALTY_PERCENTAGE).div(100);
        // Updates the royalty balance
        royaltyBalance = royaltyBalance.add(royaltyAmount);

				// // Safely mints the new token
        _safeMint(_to, newTokenId);
        // Sets the token URI
        _setTokenURI(newTokenId, audioURI);

				// Emits an event for NFT minting
        emit NFTMinted(newTokenId, _to, msg.value);
        // Emits an event for royalty collection
        emit RoyaltyCollected(newTokenId, royaltyAmount);

				//  Returns the new token ID
        return newTokenId;
    }

    function payRoyalties() external {
			  // Retrieves the royalty balance
        uint256 amount = royaltyBalance;
        // Resets the royalty balance
        royaltyBalance = 0;

				// Transfers the royalty amount to the artist
        (bool success, ) = payable(artist).call{value: amount}("");
        // Ensures the transfer was successful
        require(success, "Royalty payout failed");

				// Emits an event for royalty payment
        emit RoyaltyPaid(artist, amount);
    }

    function getInfo(address user) external view onlyMintedUser(user) returns (NFTInfo memory)  {
		    // Returns an NFTInfo struct with detailed information.
        return NFTInfo({
            nftPrice: nftPrice,
            artist: artist,
            audioURI: audioURI,
            coverURI: coverURI,
            royaltyBalance: royaltyBalance,
            currentTokenId: _currentTokenId
        });
    }

}