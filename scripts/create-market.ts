import { ethers } from "ethers";
import { Provider, Contract, utils } from "zksync-ethers";
import * as dotenv from "dotenv";

dotenv.config();

// Contract address for MarketFactory
const MARKET_FACTORY_ADDRESS = "0x03318F2FC24216300AD20DE97eca0dA31EC71853";

// Parameters provided by the user
const INDEX_TOKEN = "0xA36651B38198dE1154a813BCf2D0d71F859ebD0B";
const LONG_TOKEN = "0xC1AA99c3881B26901aF70738A7C217dc32536d36";
const SHORT_TOKEN = "0xC1AA99c3881B26901aF70738A7C217dc32536d36";
const MARKET_TYPE = "0x4bd5869a01440a9ac6d7bf7aa7004f402b52b845f20e2cec925101e13d84d075";

// Paymaster address and configuration
const PAYMASTER_ADDRESS = "0x98546B226dbbA8230cf620635a1e4ab01F6A99B2";

// Ledger configuration
const MNEMONIC_INDEX = 13;
const GAS_PRICE = 250000;

// ABI fragment for the createMarket function
const marketFactoryAbi = [
  "function createMarket(address indexToken, address longToken, address shortToken, bytes32 marketType) returns (tuple(address marketToken, address indexToken, address longToken, address shortToken))"
];

/**
 * Implementation of Ledger signing using Frame (https://frame.sh)
 * Frame provides a system-wide signing interface with native support for Ledger
 * 
 * Before running this script:
 * 1. Install Frame: https://frame.sh
 * 2. Install eth-provider: npm install eth-provider
 * 3. Connect your Ledger device to your computer
 * 4. Open Frame and make sure your Ledger is connected and unlocked
 */

async function main() {
  try {
    console.log("LEDGER SIGNING WITH FRAME FOR MARKET CREATION");
    console.log("--------------------------------------------");
    
    // Create a Frame connection
    const ethProvider = require('eth-provider'); // eth-provider is a simple EIP-1193 provider
    const frame = ethProvider('frame'); // Connect to Frame
    
    console.log("Connected to Frame. Please check the Frame application...");
    
    // Get account from Frame (which will be your Ledger account)
    const accounts = await frame.request({ method: 'eth_requestAccounts' });
    const fromAddress = accounts[0];
    
    console.log(`Using account: ${fromAddress}`);
    
    // Set chain to Sophon mainnet - this might need to be adapted based on chain ID
    // You may need to add Sophon to your Frame networks first
    // frame.setChain(50104); // Uncomment and adjust if needed for Sophon mainnet

    // Initialize provider for preparing transaction data
    const provider = new Provider('https://rpc.sophon.xyz/');
    
    // Create a contract instance for encoding function data
    const contractInterface = new ethers.Interface(marketFactoryAbi);
    
    // Encode the function data
    const calldata = contractInterface.encodeFunctionData("createMarket", [
      INDEX_TOKEN,
      LONG_TOKEN, 
      SHORT_TOKEN,
      MARKET_TYPE
    ]);
    
    // Prepare ZKSync specific paymaster parameters
    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
      type: "General",
      innerInput: new Uint8Array(),
    });
    
    console.log("Preparing transaction...");
    
    // Create transaction object to be signed by Frame/Ledger
    const tx = {
      from: fromAddress,
      to: MARKET_FACTORY_ADDRESS,
      data: calldata,
      gasPrice: ethers.parseUnits(GAS_PRICE.toString(), "gwei").toString(),
      // ZKSync specific parameters need to be handled by Frame
      // If Frame supports ZKSync, you might need to include these:
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams: paymasterParams
      }
    };
    
    console.log("Transaction prepared:");
    console.log("- From:", tx.from);
    console.log("- To:", tx.to);
    console.log("- Gas Price:", tx.gasPrice);
    console.log("- Paymaster:", PAYMASTER_ADDRESS);
    
    console.log("\nSending transaction to Frame for signing with Ledger...");
    console.log("Please check your Ledger device and approve the transaction");
    
    // Send transaction using Frame (which will use Ledger for signing)
    const txHash = await frame.request({
      method: 'eth_sendTransaction',
      params: [tx]
    });
    
    console.log("\nTransaction sent!");
    console.log("Transaction hash:", txHash);
    console.log("You can view the transaction on the block explorer");
    
    // Optional: Wait for confirmation
    console.log("\nWaiting for transaction confirmation...");
    
    // Use ethers provider to wait for the transaction receipt
    const ethersProvider = new ethers.JsonRpcProvider('https://rpc.sophon.xyz/');
    const receipt = await ethersProvider.waitForTransaction(txHash);
    
    if (receipt) {
      console.log("Transaction confirmed in block:", receipt.blockNumber);
      console.log("Market created successfully!");
    } else {
      console.log("Transaction sent, but receipt not available");
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  }); 