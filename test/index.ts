import { expect } from "chai";
import dotenv from "dotenv";
import path from "path";
import {contractExecuteGrantMembershipCall, contractExecuteSetTopicIdCall,  deployContract, getBalance, getMemberQueryCall, getTopicIdQueryCall, getWalletInstance } from "./utils";
import { AccountId, Client, Hbar, PrivateKey, TopicInfoQuery } from "@hashgraph/sdk";
import { exit } from "process";
import { CommercialDAO } from "../typechain-types/CommercialDAO";

dotenv.config({path : path.resolve(__dirname, '../.env.local')});

describe("Hedera RPC Test", function () {
let contractAddress: string;
const spDid = "did:televerse"; 
const spName = "Televerse Test #1";
const topicId = process.env.HEDERA_TOPIC_ID;
const invalidTopicIdMessage = 'INVALID_TOPIC_ID';

  before(async () => {
    try {
      expect(topicId).to.not.equal(undefined,"Please set HEDERA_TOPIC_ID in .env.local");
      expect(process.env.OPERATOR_ID).to.not.equal(undefined,"Please set OPERATOR_ID in .env.local");
      expect(process.env.OPERATOR_KEY).to.not.equal(undefined,"Please set OPERATOR_KEY in .env.local");

      const client = Client.forTestnet();

      client.setOperator(
          AccountId.fromString(process.env.OPERATOR_ID!),
          PrivateKey.fromString(process.env.OPERATOR_KEY!)
      );

      client.setDefaultMaxTransactionFee(new Hbar(20));
      client.setMaxQueryPayment(new Hbar(10));

      const topicIdQuery = new TopicInfoQuery({topicId});
      const topicIdInfo = await topicIdQuery.execute(client);
      expect(topicIdInfo.topicId).to.not.equal(undefined, "Please set HEDERA_TOPIC_ID with valid topic id in .env.local");
    } catch (e) {
      console.error(e)
      if (e instanceof Error && e.message.includes(invalidTopicIdMessage)) console.error('Please set HEDERA_TOPIC_ID with valid topic id in .env.local');
      exit();
    }
  })

  it("should be able to get the account balance", async function () {
    const balance = await getBalance();
    expect(Number(balance)).to.be.greaterThan(0);
  });

  it("should be able to deploy a contract", async function () {
    contractAddress = await deployContract();
    expect(contractAddress).to.not.equal(null);
  });

  describe("contractFunctionCall", function () {
    
    it("should be able to execute a contract function call - grantMembership", async function () {
        const wallet = await getWalletInstance();
        const serviceProvider: CommercialDAO.ServiceProviderStruct = {
          _address: wallet.address,
          _did: spDid,
          _name: spName,
          _nonce: BigInt(0),
        }

        await contractExecuteGrantMembershipCall(contractAddress, serviceProvider);
    })

    it("should be able to execute a contract view call - getMember", async function () {
      const serviceProvider = await getMemberQueryCall(contractAddress, spDid);
      
      const wallet = await getWalletInstance();
      expect(serviceProvider._address).to.equal(wallet.address);
      expect(serviceProvider._did).to.equal(spDid);
      expect(serviceProvider._name).to.equal(spName);
      expect(serviceProvider._nonce).to.equal(BigInt(1));
    })

    it("should be able to execute a contract function call - setTopicId with contract view call - getTopicId ", async function () {
        if (topicId) {
          await contractExecuteSetTopicIdCall(contractAddress, topicId)

          const res = await getTopicIdQueryCall(contractAddress);
          expect(res).to.be.equal(topicId);
        }
    })

  })

});