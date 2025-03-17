import type { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync";
import "@matterlabs/hardhat-zksync-deploy";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "sophonTestnet",
  networks: {
    zkSyncTestnet: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      zksync: true,
      verifyURL: "https://explorer.sepolia.era.zksync.dev/contract_verification",
      enableVerifyURL: true,
      accounts: [process.env.WALLET_PRIVATE_KEY as string]
    },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
    },
    dockerizedNode: {
      url: "http://localhost:3050",
      ethNetwork: "http://localhost:8545",
      zksync: true,
    },
    inMemoryNode: {
      url: "http://127.0.0.1:8011",
      ethNetwork: "localhost", 
      zksync: true,
    },
    hardhat: {
      zksync: true,
    },
    sophonMainnet: {
      url: "https://rpc.sophon.xyz",
      ethNetwork: "mainnet",
      verifyURL: "https://verification-explorer.sophon.xyz/contract_verification",
      browserVerifyURL: "https://explorer.sophon.xyz/",
      enableVerifyURL: true,
      zksync: true,
      accounts: [process.env.WALLET_PRIVATE_KEY as string]
    },
    sophonTestnet: {
      url: "https://rpc.testnet.sophon.xyz",
      ethNetwork: "sepolia",
      verifyURL: "https://api-explorer-verify.testnet.sophon.xyz/contract_verification",
      browserVerifyURL: "https://explorer.testnet.sophon.xyz/",
      enableVerifyURL: true,
      zksync: true,
      accounts: [process.env.WALLET_PRIVATE_KEY as string]
    },
  },
  zksolc: {
    version: "1.5.11",
    settings: {
    },
  },
  solidity: {
    version: "0.8.24",
  },
  etherscan: {
    enabled: true,
    apiKey: {
      sophonTestnet: process.env.ETHERSCAN_SOPHON_API_KEY as string,
      sophonMainnet: process.env.ETHERSCAN_SOPHON_API_KEY as string,
      zkSyncTestnet: process.env.ETHERSCAN_ZKSYNC_API_KEY as string,
      zkSyncMainnet: process.env.ETHERSCAN_ZKSYNC_API_KEY as string
    },
    customChains: [
      {
        network: "sophonTestnet",
        chainId: 531050104,
        urls: {
          apiURL: "https://api-testnet.sophscan.xyz/api",
          browserURL: "https://testnet.sophscan.xyz",
        },
      },
      {
        network: "sophonMainnet",
        chainId: 50104,
        urls: {
          apiURL: "https://api.sophscan.xyz/api",
          browserURL: "https://sophscan.xyz",
        },
      },
      {
        network: "zkSyncTestnet",
        chainId: 300,
        urls: {
          apiURL: "https://api-testnet-era.zksync.network/api",
          browserURL: "https://testnet-era.zksync.network",
        },
      },
    ],
  }
};

export default config;
