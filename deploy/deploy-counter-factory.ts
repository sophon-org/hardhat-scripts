import { Contract, utils } from "zksync-ethers";
import * as hre from "hardhat";
import { ethers } from "ethers";
import { deployContract, getWallet, getSophonPaymasterParams } from "./utils";

// Helper function to create delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  // Check if factory address is provided via command-line args or environment variable
  // Format: npx hardhat run deploy/deploy-counter-factory.ts --network <network> -- --factoryAddress=0x... --initialNumber=42
  // or set FACTORY_ADDRESS and INITIAL_COUNTER_NUMBER environment variables
  const args = process.argv.slice(2);
  let factoryAddressArg = "";
  let initialNumberArg = "";
  
  for (const arg of args) {
    if (arg.startsWith("--factoryAddress=")) {
      factoryAddressArg = arg.split("=")[1];
    } else if (arg.startsWith("--initialNumber=")) {
      initialNumberArg = arg.split("=")[1];
    }
  }
  
  const factoryAddress = factoryAddressArg || process.env.FACTORY_ADDRESS;
  const initialNumber = initialNumberArg 
    ? parseInt(initialNumberArg) 
    : process.env.INITIAL_COUNTER_NUMBER 
      ? parseInt(process.env.INITIAL_COUNTER_NUMBER) 
      : 10; // Default initial number if not specified
  
  console.log(`Using initial counter number: ${initialNumber}`);
  
  let counterFactory;
  
  if (factoryAddress) {
    // Use existing factory
    console.log(`Using existing CounterFactory at ${factoryAddress}`);
    const wallet = getWallet();
    const factoryArtifact = await hre.artifacts.readArtifact("CounterFactory");
    counterFactory = new Contract(factoryAddress, factoryArtifact.abi, wallet);
  } else {
    // Deploy new factory
    console.log("Deploying new CounterFactory...");
    counterFactory = await deployContract("CounterFactory");
    console.log(`CounterFactory deployed at: ${await counterFactory.getAddress()}`);
    
    // Wait for 10 seconds before creating a new counter
    console.log("Waiting for 10 seconds...");
    await delay(10000);
    console.log("Wait complete. Proceeding to create a counter.");
  }
  
  // Create a new counter using the factory
  console.log("Creating a new Counter contract...");
  
  // Generate a random salt
  const salt = ethers.keccak256(ethers.toUtf8Bytes(`counter_${Date.now()}`));
  console.log(`Using salt: ${salt}`);
  
  // Get the wallet
  const wallet = getWallet();
  
  // Predict counter address before deployment
  const predictedAddress = await counterFactory.predictCounterAddressWithInitialNumber(salt, initialNumber);
  console.log(`Predicted Counter address: ${predictedAddress}`);
  
  // Create a new counter using the factory with paymaster params
  const tx = await counterFactory.createCounter(salt, initialNumber, {
    customData: {
      paymasterParams: getSophonPaymasterParams(),
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
    },
  });
  
  const receipt = await tx.wait();
  console.log(`Counter creation transaction: ${receipt?.hash}`);
  
  // Get the deployed counter address
  const counterAddress = await counterFactory.getCounterAddress(salt);
  console.log(`Counter deployed at: ${counterAddress}`);
  
  // Verify the Counter contract
  if (hre.network.config.verifyURL) {
    console.log("Verifying Counter contract...");
    await hre.run("verify:verify", {
      address: counterAddress,
      contract: "contracts/Counter.sol:Counter",
      constructorArguments: [initialNumber],
      noCompile: true,
    });
  }
  
  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 