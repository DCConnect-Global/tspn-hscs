import abi from "../../contracts/abi";
import axios from "axios";
import { BrowserProvider, ethers, TransactionResponse } from "ethers";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function contractExecuteFcn(walletData: (string | BrowserProvider | undefined)[], contractAddress: string): Promise<[string, number]> {
	console.log(`\n=======================================`);
	console.log(`- Executing the smart contract...🟠`);

	// ETHERS PROVIDER AND SIGNER
	const provider = walletData[1];
  if (! (provider instanceof BrowserProvider)) {
    console.log(`- Provider is undefined`);
    return Promise.reject(`- Provider is undefined`);
  }
	const signer = await provider.getSigner();

	// EXECUTE THE SMART CONTRACT
	let txHash: string = "";
	let finalCount: number = 0;
	try {
		// CHECK SMART CONTRACT STATE
		const initialCount = await getCountState();
		console.log(`- Initial count: ${initialCount}`);

		// EXECUTE CONTRACT FUNCTION
		const gasLimit = 100000;
		const myContract = new ethers.Contract(contractAddress, abi, signer);
    // https://docs.ethers.org/v5/api/contract/contract/#contract-functionsSend
		const incrementTx: TransactionResponse = await myContract.increment({ gasLimit: gasLimit });
    txHash = incrementTx.hash;

		// CHECK SMART CONTRACT STATE AGAIN
		await delay(5000); // DELAY TO ALLOW MIRROR NODES TO UPDATE BEFORE QUERYING

		finalCount = await getCountState();
		console.log(`- Final count: ${finalCount}`);
		console.log(`- Contract executed. Transaction hash: \n${txHash} ✅`);
	} catch (executeError) {
    if (executeError instanceof Error) {
      console.log(`- ${executeError.message.toString()}`);
    }
	}

	return [txHash, finalCount];

	async function getCountState() {
		let countDec;
		const countInfo = await axios.get(`https://${walletData[2]}.mirrornode.hedera.com/api/v1/contracts/${contractAddress}/state`);

		if (countInfo.data.state[0] !== undefined) {
			const countHex = countInfo.data.state[0].value;
			countDec = parseInt(countHex, 16);
		} else {
			countDec = 0;
		}
		return countDec;
	}
}

export default contractExecuteFcn;
