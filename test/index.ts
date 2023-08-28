import hre from "hardhat";
import { expect } from "chai";
import { contractExecuteCall, contractQueryCall, deployContract, getBalance } from "./utils";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Hedera RPC Test", function () {
let contractAddress: string;
let signers: HardhatEthersSigner[];
const spDid = "did:televerse"; 
const topicId="123";

  before(async function () {
    signers = await hre.ethers.getSigners();
  });

  it("should be able to get the account balance", async function () {
    const balance = await getBalance();
    expect(Number(balance)).to.be.greaterThan(0);
  });

  it("should be able to deploy a contract", async function () {
    contractAddress = await deployContract();
    expect(contractAddress).to.not.be.null;
  });

  describe("contractFunctionCall", function () {
    
    it("should be able to execute a contract function call - setSpDid with contract view call - getSpDid ", async function () {
        await contractExecuteCall(contractAddress, spDid);

        const res = await contractQueryCall(contractAddress);
        expect(res).to.be.equal(spDid);
    })

    it("should be able to execute a contract function call - getTopicId with contract view call - setTopicId ", async function () {
        await contractExecuteCall(contractAddress, topicId,false)

        const res = await contractQueryCall(contractAddress,false);
        expect(res).to.be.equal(topicId);
    })

  })

});