import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config({path : '.env.local'});

const config: HardhatUserConfig = {
    mocha: {
      timeout: 3600000,
    },
    solidity: {
      version: "0.8.9",
      settings: {
        optimizer: {
          enabled: true,
          runs: 500,
        },
      },
    },
    //this specifies which network should be used when running Hardhat tasks
    defaultNetwork: "testnet",
    networks: {
      testnet: {
        //HashIO testnet endpoint from the TESTNET_ENDPOINT variable in the project .env the file
        url: process.env.TESTNET_ENDPOINT,
        //the Hedera testnet account ECDSA private
        //the public address for the account is derived from the private key
        accounts: [
          process.env.TESTNET_OPERATOR_PRIVATE_KEY ?? '',
        ],
      },
    },
  };

export default config;