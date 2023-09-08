import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {ethers} from "hardhat";
import { CommercialDAO } from "../typechain-types/CommercialDAO";

const HEDERA_TESTNET_CHAIN_ID = 296;

const getBalance = async () => {
  //Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.ts, to a wallet variable.
  const wallet = await getWalletInstance();
  //Wallet object (which is essentially signer object) has some built in functionality like getBalance, getAddress and more
  const balance = (await wallet.provider.getBalance(wallet)).toString();
  const chainId = (await wallet.provider.getNetwork()).chainId

  // TODO: chain id so far only covers wei and tinybars
  console.log(`The address ${wallet.address} has ${balance} ${chainId === BigInt(HEDERA_TESTNET_CHAIN_ID) ? 'tinybars': 'wei'}`);
  return balance;
};

const deployContract = async () => {
    
  const wallet = await getWalletInstance();

  //Initialize a contract factory object
  //name of contract as first parameter
  //wallet/signer used for signing the contract calls/transactions with this contract
  const CommercialDao = await ethers.getContractFactory("CommercialDAO", wallet);
  //Using already intilized contract facotry object with our contract, we can invoke deploy function to deploy the contract.
  //Accepts constructor parameters from our contract
  const commercialDao = await CommercialDao.deploy();
  //We use wait to recieve the transaction (deployment) receipt, which contrains contractAddress
  const contractAddress = await commercialDao.getAddress();

  console.log(`Contract deployed to: ${contractAddress}`);

  return contractAddress;
};

const getMemberQueryCall = async (address: string, did:string) => {
  //Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.js, to a wallet variable.
  const wallet = await getWalletInstance();
  const commercialDao = await getContractInstance(address, wallet);

  const callRes = await commercialDao.getMember(did);

  console.log(`getSpDidList query result: ${callRes}`);

  return callRes;
};

const getTopicIdQueryCall = async (address: string) => {
  //Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.js, to a wallet variable.
  const wallet = await getWalletInstance();
  const commercialDao = await getContractInstance(address, wallet);
 
  const callRes = await commercialDao.getTopicId();

  console.log(`getTopicId query result: ${callRes}`);

  return callRes;
};

const contractExecuteGrantMembershipCall = async (address: string, serviceProvider: CommercialDAO.ServiceProviderStruct) => {

  //Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.js, to a wallet variable.
  const wallet = await getWalletInstance();
  const commercialDao = await getContractInstance(address, wallet);

  const updateTx = await commercialDao.grantMembership(serviceProvider)
  
  console.log(`Updated call result:`, serviceProvider);

  return updateTx;
};

const contractExecuteSetTopicIdCall = async (address: string, param:string) => {

    //Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.js, to a wallet variable.
    const wallet = await getWalletInstance();
  
    const commercialDao = await getContractInstance(address, wallet);
  
    const updateTx =  await commercialDao.setTopicId(param)
    
    console.log(`Updated call result: ${param}`);
  
    return updateTx;
  };

const getContractInstance = async (address: string, wallet: HardhatEthersSigner) => await ethers.getContractAt("CommercialDAO", address, wallet);
const getWalletInstance = async () => (await ethers.getSigners())[0];

export {
    getBalance,
    getWalletInstance,
    deployContract,
    getMemberQueryCall,
    getTopicIdQueryCall,
    contractExecuteGrantMembershipCall,
    contractExecuteSetTopicIdCall
}