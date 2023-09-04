import { ethers } from "hardhat";

const getBalance = async () => {
  //Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.ts, to a wallet variable.
  const wallet = (await ethers.getSigners())[0];
  //Wallet object (which is essentially signer object) has some built in functionality like getBalance, getAddress and more
  const balance = (await wallet.provider.getBalance(wallet)).toString();
  console.log(`The address ${wallet.address} has ${balance} tinybars`);

  return balance;
};

const deployContract = async () => {
    
    const wallet = (await ethers.getSigners())[0];
  
    //Initialize a contract factory object
    //name of contract as first parameter
    //wallet/signer used for signing the contract calls/transactions with this contract
    const CommercialDao = await ethers.getContractFactory("CommercialDAO", wallet);
    //Using already intilized contract facotry object with our contract, we can invoke deploy function to deploy the contract.
    //Accepts constructor parameters from our contract
    const commercialDao = await CommercialDao.deploy({gasLimit: 300_000});
    //We use wait to recieve the transaction (deployment) receipt, which contrains contractAddress
    const contractAddress = await commercialDao.getAddress();
  
    console.log(`Contract deployed to: ${contractAddress}`);
  
    return contractAddress;
  };

const contractQueryCall = async (address: string, spDid: boolean = true) => {
//Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.js, to a wallet variable.
const wallet = (await ethers.getSigners())[0];

//wallet/signer used for signing the contract calls/transactions with this contract
const commercialDao = await ethers.getContractAt("CommercialDAO", address, wallet);
//using the smart contract call functions from the contract. 
const callRes = spDid ? await commercialDao.getSpDid(wallet.address) : await commercialDao.getTopicId();

console.log(`Contract call result: ${callRes}`);

return callRes;
};

const contractExecuteCall = async (address: string, param:string, spDid: boolean=true) => {
    //Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.js, to a wallet variable.
    const wallet = (await ethers.getSigners())[0];
  
    //wallet/signer used for signing the contract calls/transactions with this contract
    const commercialDao = await ethers.getContractAt("CommercialDAO", address, wallet);
  
    const updateTx = spDid ? await commercialDao.setSpDid(wallet.address, param, {gasLimit: 100_000}) : await commercialDao.setTopicId(param, {gasLimit: 100_000})
    
    console.log(`Updated call result: ${param}`);
  
    return updateTx;
  };

export {
    getBalance,
    deployContract,
    contractQueryCall,
    contractExecuteCall
}