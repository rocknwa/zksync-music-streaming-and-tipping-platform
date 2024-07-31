// Imports the Provider and Wallet classes from the zksync-ethers library to interact with zkSync.
import { Provider, Wallet } from "zksync-ethers";
// Imports Hardhat runtime environment, which provides various functions to interact with the Hardhat environment.
import * as hre from "hardhat";
// Imports the Deployer class to facilitate deploying contracts on zkSync using Hardhat.
import { Deployer } from "@matterlabs/hardhat-zksync";
// Imports the dotenv library to load environment variables from a .env file.
import dotenv from "dotenv";
// Imports the ethers library to interact with the Ethereum blockchain.
import { ethers } from "ethers";
// Extends Hardhat with zkSync node and verification capabilities.
import "@matterlabs/hardhat-zksync-node/dist/type-extensions";
import "@matterlabs/hardhat-zksync-verify/dist/src/type-extensions";

// Load env file
dotenv.config();

// The getProvider function retrieves the RPC URL from the Hardhat configuration and initializes a zkSync provider.
export const getProvider = () => {
	// Retrieves the RPC URL from the Hardhat network configuration.
  const rpcUrl = hre.network.config.url;
  // Throws an error if the RPC URL is not found.
  if (!rpcUrl) throw `⛔️ RPC URL wasn't found in "${hre.network.name}"! Please add a "url" field to the network config in hardhat.config.ts`;

  // Initializes a new zkSync Provider with the given RPC URL.
  const provider = new Provider(rpcUrl);
	// Returns the initialized provider.
  return provider;
}

// The getWallet function initializes a zkSync wallet using a provided 
// private key or the private key from the environment variables.
export const getWallet = (privateKey?: string) => {
	// Checks if a private key is provided as an argument.
  if (!privateKey) {
    // Get wallet private key from .env file
    // Throws an error if the private key is not provided and not found in the environment variables.
    if (!process.env.WALLET_PRIVATE_KEY) throw "⛔️ Wallet private key wasn't found in .env file!";
  }
	// Calls the getProvider function to get the zkSync provider.
  const provider = getProvider();

  // Initializes a new zkSync Wallet with the provided or environment variable private key and the provider.
  const wallet = new Wallet(privateKey ?? process.env.WALLET_PRIVATE_KEY!, provider);
	// Returns the initialized wallet.
  return wallet;
}

// The verifyEnoughBalance function checks if a wallet has sufficient balance for a specified amount.
export const verifyEnoughBalance = async (wallet: Wallet, amount: bigint) => {
  // Check if the wallet has enough balance.
  // Fetches the current balance of the wallet.
  const balance = await wallet.getBalance();
  // Throws an error if the wallet balance is less than the required amount.
  if (balance < amount) throw `⛔️ Wallet balance is too low! Required ${ethers.formatEther(amount)} ETH, but current ${wallet.address} balance is ${ethers.formatEther(balance)} ETH`;
}

// The verifyContract function verifies a deployed contract on a block explorer.
export const verifyContract = async (data: {
  address: string,
  contract: string,
  constructorArguments: string,
  bytecode: string
}) => {
	// Calls the Hardhat verify task to verify the contract on a block explorer.
  const verificationRequestId: number = await hre.run("verify:verify", {
    ...data,
    noCompile: true,
  });
  // Returns the verification request ID.
  return verificationRequestId;
}

type DeployContractOptions = {
  /**
   * If true, the deployment process will not print any logs.
   */
  silent?: boolean
  /**
   * If true, the contract will not be verified on Block Explorer.
   */
  noVerify?: boolean
  /**
   * If specified, the contract will be deployed using this wallet.
   */ 
  wallet?: Wallet
}

// The deployContract function deploys a smart contract using a 
// specified artifact name, constructor arguments, and options.
export const deployContract = async (contractArtifactName: string, constructorArguments?: any[], options?: DeployContractOptions) => {
	// Defines a logging function to conditionally print messages based on the silent option.
  const log = (message: string) => {
    if (!options?.silent) console.log(message);
  }
	// Logs the start of the deployment process.
  log(`\\nStarting deployment process of "${contractArtifactName}"...`);
	// Uses a provided wallet or creates a new one if not specified.
  const wallet = options?.wallet ?? getWallet();
  // Initializes a new Deployer with the Hardhat environment and wallet.
  const deployer = new Deployer(hre, wallet);
  // Loads the contract artifact, catching errors if the artifact is not found.
  const artifact = await deployer.loadArtifact(contractArtifactName).catch((error) => {
    if (error?.message?.includes(`Artifact for contract "${contractArtifactName}" not found.`)) {
      console.error(error.message);
      throw `⛔️ Please make sure you have compiled your contracts or specified the correct contract name!`;
    } else {
      throw error;
    }
  });

  // Estimates the deployment fee for the contract.
  const deploymentFee = await deployer.estimateDeployFee(artifact, constructorArguments || []);
  // Logs the estimated deployment cost.
  log(`Estimated deployment cost: ${ethers.formatEther(deploymentFee)} ETH`);

  // Verifies that the wallet has enough balance for deployment.
  await verifyEnoughBalance(wallet, deploymentFee);

  // Deploys the contract using the deployer.
  const contract = await deployer.deploy(artifact, constructorArguments);
  // Retrieves the deployed contract address.
  const address = await contract.getAddress();
  // Encodes the constructor arguments.
  const constructorArgs = contract.interface.encodeDeploy(constructorArguments);
  // Constructs the full contract source path.
  const fullContractSource = `${artifact.sourceName}:${artifact.contractName}`;

  // Logs the successful deployment of the contract.
  log(`\\n"${artifact.contractName}" was successfully deployed:`);
  log(` - Contract address: ${address}`);
  log(` - Contract source: ${fullContractSource}`);
  log(` - Encoded constructor arguments: ${constructorArgs}\\n`);

  if (!options?.noVerify && hre.network.config.verifyURL) {
    log(`Requesting contract verification...`);
    await verifyContract({
      address,
      contract: fullContractSource,
      constructorArguments: constructorArgs,
      bytecode: artifact.bytecode,
    });
  }

  return contract;
}

/**
 * Rich wallets can be used for testing purposes.
 * Available on zkSync In-memory node and Dockerized node.
 */
export const LOCAL_RICH_WALLETS = [
  {
    address: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
    privateKey: "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110"
  },
  {
    address: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
    privateKey: "0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3"
  },
  {
    address: "0x0D43eB5B8a47bA8900d84AA36656c92024e9772e",
    privateKey: "0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e"
  },
  {
    address: "0xA13c10C0D5bd6f79041B9835c63f91de35A15883",
    privateKey: "0x850683b40d4a740aa6e745f889a6fdc8327be76e122f5aba645a5b02d0248db8"
  },
  {
    address: "0x8002cD98Cfb563492A6fB3E7C8243b7B9Ad4cc92",
    privateKey: "0xf12e28c0eb1ef4ff90478f6805b68d63737b7f33abfa091601140805da450d93"
  },
  {
    address: "0x4F9133D1d3F50011A6859807C837bdCB31Aaab13",
    privateKey: "0xe667e57a9b8aaa6709e51ff7d093f1c5b73b63f9987e4ab4aa9a5c699e024ee8"
  },
  {
    address: "0xbd29A1B981925B94eEc5c4F1125AF02a2Ec4d1cA",
    privateKey: "0x28a574ab2de8a00364d5dd4b07c4f2f574ef7fcc2a86a197f65abaec836d1959"
  },
  {
    address: "0xedB6F5B4aab3dD95C7806Af42881FF12BE7e9daa",
    privateKey: "0x74d8b3a188f7260f67698eb44da07397a298df5427df681ef68c45b34b61f998"
  },
  {
    address: "0xe706e60ab5Dc512C36A4646D719b889F398cbBcB",
    privateKey: "0xbe79721778b48bcc679b78edac0ce48306a8578186ffcb9f2ee455ae6efeace1"
  },
  {
    address: "0xE90E12261CCb0F3F7976Ae611A29e84a6A85f424",
    privateKey: "0x3eb15da85647edd9a1159a4a13b9e7c56877c4eb33f614546d4db06a51868b1c"
  }
]