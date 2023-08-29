import {
    Client,
    PrivateKey,
    AccountId, Hbar, 
} from "@hashgraph/sdk";


import dotenv from "dotenv";
import path from "path";
import { deployContract, executeGetSpDidMessage, executeSetSpDidMessage, executeSetTopicIdMessage, getEventsFromMirror, queryGetSpDidMessage, queryGetTopicIdMessage } from "./utils";


dotenv.config({path : path.resolve(__dirname, '../.env.local')});

const client = Client.forTestnet();

/**
 * Runs each step of the example one after the other
 */
async function main() {

  const spDid = "did:televerse"; 
  const topicId ="0.0.2982023";

    if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
        throw new Error('OPERATOR_ID and OPERATOR_KEY must be set in .env.local');
    }

    try {
        client.setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    
        client.setDefaultMaxTransactionFee(new Hbar(20));
        client.setMaxQueryPayment(new Hbar(10));

        // const operatorSolidityAddress = AccountId.fromString(process.env.OPERATOR_ID).toSolidityAddress();
        // 40 is length of EVM address and extra 2 is the padding
        const operatorSolidityAddress = client.operatorPublicKey?.toEvmAddress().padStart(42,'0x');
        // console.log(operatorSolidityAddress);

        if(!operatorSolidityAddress) throw new Error(`operatorSolidityAddress is null`);
    
        // deploy the contract to Hedera from bytecode
        const contractId = await deployContract(client);

        // call the contract's setSpDid function
        await executeSetSpDidMessage(client, contractId, operatorSolidityAddress ,spDid);
        // query the contract's getSpDid function
        await queryGetSpDidMessage(client, contractId, operatorSolidityAddress);
        // call the contract's getSpDid function
        await executeGetSpDidMessage(client, contractId, operatorSolidityAddress);

        // call the contract's setTopicId function - 0.10.1 as dummy topic id
        await executeSetTopicIdMessage(client,contractId, operatorSolidityAddress, topicId);
        // query the contract's getTopicId function
        await queryGetTopicIdMessage(client,contractId, operatorSolidityAddress);

        // get contract events from a mirror node (No fee at all. Cheapest to get query)
        await getEventsFromMirror(client ,contractId);
        
    }catch(e) {
        console.error(e)
    } finally {
        client.close();
        process.exit();
    }

}

void main();