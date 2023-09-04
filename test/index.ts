import {
    Client,
    PrivateKey,
    AccountId, Hbar, TopicInfoQuery, 
} from "@hashgraph/sdk";


import dotenv from "dotenv";
import path from "path";
import { deployContract, executeGetSpDidMessage, executeSetSpDidMessage, executeSetTopicIdMessage, getEventsFromMirror, queryGetSpDidMessage, queryGetTopicIdMessage } from "./utils";


dotenv.config({path : path.resolve(__dirname, '../.env.local')});

/**
 * Runs each step of the example one after the other
 */
async function main() {

  const client = Client.forTestnet();
  const spDid = "did:televerse"; 
  const topicId =process.env.HEDERA_TOPIC_ID;
  const invalidTopicIdMessage = 'INVALID_TOPIC_ID';

    try {

        if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
            throw new Error('OPERATOR_ID and OPERATOR_KEY must be set in .env.local');
        }

        if (!topicId) throw new Error('HEDERA_TOPIC_ID must be set in .env.local');

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

        const topicIdQuery = new TopicInfoQuery({topicId});
        await topicIdQuery.execute(client);
    
        // deploy the contract to Hedera from bytecode
        const contractId = await deployContract(client);

        // call the contract's setSpDid function
        await executeSetSpDidMessage(client, contractId, operatorSolidityAddress ,spDid);
        // query the contract's getSpDid function
        await queryGetSpDidMessage(client, contractId, operatorSolidityAddress);
        // call the contract's getSpDid function
        await executeGetSpDidMessage(client, contractId, operatorSolidityAddress);

        // call the contract's setTopicId function with valid topic id set in .env.local
        await executeSetTopicIdMessage(client,contractId, topicId);
        // query the contract's getTopicId function
        await queryGetTopicIdMessage(client,contractId);

        // get contract events from a mirror node (No fee at all. Cheapest to get query)
        await getEventsFromMirror(contractId);
        
    }catch(e) {
        console.error(e)
        if(e.message.includes(invalidTopicIdMessage)){
            console.error('Please set HEDERA_TOPIC_ID with valid topic id in .env.local');
        }
    } finally {
        client.close();
        process.exit();
    }

}

void main();