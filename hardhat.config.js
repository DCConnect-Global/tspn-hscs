require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
//import dotenv library to access environment variables stored in .env file
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
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
          process.env.TESTNET_OPERATOR_PRIVATE_KEY,
        ],
      },
    },
  };