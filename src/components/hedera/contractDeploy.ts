import abi from "../../contracts/abi";
import bytecode from "../../contracts/bytecode";
import { BrowserProvider, ContractFactory } from "ethers";

async function contractDeployFcn(walletData: (string | BrowserProvider | undefined)[]) {
	console.log(`\n=======================================`);
	console.log(`- Deploying smart contract on Hedera...🟠`);

	// ETHERS PROVIDER AND SIGNER
	const provider = walletData[1];
  if (! (provider instanceof BrowserProvider)) {
    console.log(`- Provider is undefined`);
    return;
  }
	const signer = await provider.getSigner();

	// DEPLOY SMART CONTRACT
	let contractAddress;
	try {
		const gasLimit = 4000000;

		const myContract = new ContractFactory(abi, bytecode, signer);
		const contractDeployTx = await myContract.deploy({ gasLimit: gasLimit });
		const contractDeployRx = await contractDeployTx.deploymentTransaction()?.wait();
		contractAddress = contractDeployRx?.contractAddress;
		console.log(`- Contract deployed to address: \n${contractAddress} ✅`);
	} catch (deployError) {
    if (deployError instanceof Error) {
      console.log(`- ${deployError.message.toString()}`);
    }
	}
	return contractAddress;
}
export default contractDeployFcn;
