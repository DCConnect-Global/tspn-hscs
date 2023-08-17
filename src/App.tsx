import { useState } from "react";
import MyGroup from "./components/MyGroup";
import walletConnectFcn from "./components/hedera/walletConnect";
import contractDeployFcn from "./components/hedera/contractDeploy";
import contractExecuteFcn from "./components/hedera/contractExecute";
import "./styles/App.css";
import {BrowserProvider} from "ethers";

function App() {
	const [walletData, setWalletData] = useState<(string | BrowserProvider | undefined)[]>();
	const [account, setAccount] = useState<string | BrowserProvider | undefined>();
	const [network, setNetwork] = useState<string | BrowserProvider | undefined>();
	const [contractAddress, setContractAddress] = useState<string>();

	const [connectTextSt, setConnectTextSt] = useState("🔌 Connect here...");
	const [contractTextSt, setContractTextSt] = useState<string>("");
	const [executeTextSt, setExecuteTextSt] = useState<string>("");

	const [connectLinkSt, setConnectLinkSt] = useState<string>("");
	const [contractLinkSt, setContractLinkSt] = useState<string>("");
	const [executeLinkSt, setExecuteLinkSt] = useState<string>("");

	async function connectWallet() {
		if (account !== undefined) {
			setConnectTextSt(`🔌 Account ${account} already connected ⚡ ✅`);
		} else {
			const wData = await walletConnectFcn();

			let newAccount = wData[0];
			let newNetwork = wData[2];
			if (newAccount !== undefined) {
				setConnectTextSt(`🔌 Account ${newAccount} connected ⚡ ✅`);
				setConnectLinkSt(`https://hashscan.io/${newNetwork}/account/${newAccount}`);

				setWalletData(wData);
				setAccount(newAccount);
				setNetwork(newNetwork);
				setContractTextSt("");
			}
		}
	}

	async function contractDeploy() {
		if (account === undefined || walletData === undefined) {
			setContractTextSt("🛑 Connect a wallet first! 🛑");
		} else {
			const cAddress = await contractDeployFcn(walletData);

			if (cAddress == null) {
			} else {
				setContractAddress(cAddress);
				setContractTextSt(`Contract ${cAddress} deployed ✅`);
				setExecuteTextSt("");
				setContractLinkSt(`https://hashscan.io/${network}/address/${cAddress}`);
			}
		}
	}

	async function contractExecute() {
		if (contractAddress === undefined || walletData === undefined) {
			setExecuteTextSt("🛑 Deploy a contract first! 🛑");
		} else {
      console.log("hollo");
			const [txHash, finalCount] = await contractExecuteFcn(walletData, contractAddress);

      console.log(txHash, finalCount);
			if (txHash === undefined || finalCount === undefined) {
			} else {
				setExecuteTextSt(`Count is: ${finalCount} | Transaction hash: ${txHash} ✅`);
				setExecuteLinkSt(`https://hashscan.io/${network}/tx/${txHash}`);
			}
		}
	}
  return (
		<div className="App">
			<h1 className="header">Here's a counter dapp with MetaMask and Hedera!</h1>
			<MyGroup fcn={connectWallet} buttonLabel={"Connect Wallet"} text={connectTextSt} link={connectLinkSt} />

			<MyGroup fcn={contractDeploy} buttonLabel={"Deploy Contract"} text={contractTextSt} link={contractLinkSt} />

			<MyGroup fcn={contractExecute} buttonLabel={"Execute Contract (+1)"} text={executeTextSt} link={executeLinkSt} />

			<div className="logo">
				<div className="symbol">
					<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
						<path d="M20 0a20 20 0 1 0 20 20A20 20 0 0 0 20 0" className="circle"></path>
						<path d="M28.13 28.65h-2.54v-5.4H14.41v5.4h-2.54V11.14h2.54v5.27h11.18v-5.27h2.54zm-13.6-7.42h11.18v-2.79H14.53z" className="h"></path>
					</svg>
				</div>
				<span>Hedera</span>
			</div>
		</div>
  );
}

export default App;
