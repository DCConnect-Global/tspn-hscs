import {
    Client,
    PrivateKey,
    ContractCreateTransaction,
    FileCreateTransaction,
    AccountId, Hbar, ContractExecuteTransaction, ContractCallQuery, 
    ContractLogInfo 
} from "@hashgraph/sdk";

import { Interface } from "@ethersproject/abi";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import abi from "../src/contracts/abi";
import bytecode from "../src/contracts/bytecode";
import {paths} from '../types'

dotenv.config({path : path.resolve(__dirname, '../.env.local')});

type ContractsResultLog = paths['/api/v1/contracts/results/logs']['get']['responses'][200]["content"]["application/json"]

interface LogStruct {
    topics: Array<string>; 
    data: string;
}

const client = Client.forTestnet();
const abiInterface = new Interface(abi);

const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Runs each step of the example one after the other
 */
async function main() {

    if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
        throw new Error('OPERATOR_ID and OPERATOR_KEY must be set in .env.local');
    }

    try {
        client.setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    
        client.setDefaultMaxTransactionFee(new Hbar(5));
        client.setMaxQueryPayment(new Hbar(5));

        const operatorSolidityAddress = AccountId.fromString(process.env.OPERATOR_ID).toSolidityAddress();

        if(!operatorSolidityAddress) throw new Error(`operatorSolidityAddress is null`);
    
        // deploy the contract to Hedera from bytecode
        const contractId = await deployContract(client);
    
        // call the contract's setSpDid function
        await executeSetSpDidMessage(contractId, operatorSolidityAddress ,'did:dcconnect:1');
        // query the contract's getSpDid function
        await queryGetSpDidMessage(contractId, operatorSolidityAddress);
        // call the contract's getSpDid function
        await executeGetSpDidMessage(contractId, operatorSolidityAddress);

        // call the contract's setTopicId function - 0.10.1 as dummy topic id
        await executeSetTopicIdMessage(contractId, operatorSolidityAddress, '0.10.1');
        // query the contract's getTopicId function
        await queryGetTopicIdMessage(contractId, operatorSolidityAddress);

        // get contract events from a mirror node
        await getEventsFromMirror(contractId);
        
    }catch(e) {
        console.error(e)
    } finally {
        client.close();
        process.exit();
    }

}

/**
 * Deploys the contract to Hedera by first creating a file containing the bytecode, then creating a contract from the resulting
 * FileId, specifying a parameter value for the constructor and returning the resulting ContractId
 */
async function deployContract(client: Client) {
    console.log(`\nDeploying the contract`);

    if(!client.operatorPublicKey) throw new Error(`client.operatorPublicKey is null`);

    // Create a file on Hedera which contains the contact bytecode.
    // Note: The contract bytecode **must** be hex encoded, it should not
    // be the actual data the hex represents
    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([client.operatorPublicKey])
        .setContents(bytecode)
        .execute(client);

    // Fetch the receipt for transaction that created the file
    const fileReceipt = await fileTransactionResponse.getReceipt(client);

    // The file ID is located on the transaction receipt
    const fileId = fileReceipt.fileId;

    if(!fileId) throw new Error(`fieldId is null`);

    // Comment out since contract doesn't require parameter for the time being
    // TODO: Uncomment if constructor parameters are required
    // get the constructor parameter
    // .slice(2) to remove leading '0x'
    // const constructParameterAsHexString = abiInterface.encodeDeploy([constructMessage]).slice(2);
    // convert to a Uint8Array
    // const constructorParametersAsUint8Array = Buffer.from(constructParameterAsHexString, 'hex');

    // Create the contract
    const contractTransactionResponse = await new ContractCreateTransaction()
        // Set the parameters that should be passed to the contract constructor
        // using the output from the ethers.js library
        // .setConstructorParameters(constructorParametersAsUint8Array)
        // Set gas to create the contract
        .setGas(9_000_000)
        // The contract bytecode must be set to the file ID containing the contract bytecode
        .setBytecodeFileId(fileId)
        .execute(client);

    // Fetch the receipt for the transaction that created the contract
    const contractReceipt = await contractTransactionResponse.getReceipt(client);

    // The contract ID is located on the transaction receipt
    const contractId = contractReceipt.contractId;

    if(!contractId) throw new Error(`contractId is null`);

    console.log(`new contract ID: ${contractId.toString()}`);
    return contractId;
}

/**
 * Invokes the setSpDid function of the contract
 * @param contractId
 * @param address
 * @param spDid
 * @returns {Promise<void>}
 */
async function executeSetSpDidMessage(contractId, address, spDid) {
    console.log(`\nCalling setSpDid function with parameter value:\naddress:'${address}'\nspDid:'${spDid}'`);

    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('setSpDid',  [address, spDid]);

    // execute the transaction calling the set_message contract function
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100000)
        .execute(client);

    // get the receipt for the transaction
    await transaction.getReceipt(client);

    // a record contains the output of the function
    // as well as events, let's get events for this transaction
    const record = await transaction.getRecord(client);

    if(!record.contractFunctionResult) throw new Error(`record.contractFunctionResult is null`);

    // the events from the function call are in record.contractFunctionResult.logs.data
    // let's parse the logs using ethers.js
    // there may be several log entries
    record.contractFunctionResult.logs.forEach(log => getTransactionLogDetails(log));
}

/**
 * Invokes the getSpDid function of the contract using a query.
 * The getSpDid function doesn't mutate the contract's state, therefore a query can be used
 * @param contractId
 * @param address
 * @returns {Promise<void>}
 */
async function queryGetSpDidMessage(contractId,address) {
    console.log(`\ngetSpDid Query`);
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('getSpDid', [address]);

    // query the contract
    const contractCall = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setQueryPayment(new Hbar(2))
        .setGas(100000)
        .execute(client);

    let results = abiInterface.decodeFunctionResult('getSpDid', contractCall.bytes);
    console.log(results);
}

/**
 * Invokes the getSpDid function of the contract using a transaction and uses the resulting record to determine
 * the returned value from the function.
 * Note: The getSpDid function doesn't mutate the contract's state, therefore a query could be used, but this shows how to
 * process return values from a contract function that does mutate contract state using a TransactionRecord
 * @param contractId
 * @param address
 * @returns {Promise<void>}
 */
async function executeGetSpDidMessage(contractId, address) {
    console.log(`\ngetSpDid transaction`);

    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('getSpDid', [address]);

    // doing the same with a transaction and a record
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100000)
        .execute(client);

    // a record contains the output of the function
    const record = await transaction.getRecord(client);

    if(!record.contractFunctionResult) throw new Error(`record.contractFunctionResult is null`);

    // the result of the function call is in record.contractFunctionResult.bytes
    // let`s parse it using ethers.js
    const results = abiInterface.decodeFunctionResult('getSpDid', record.contractFunctionResult.bytes);
    console.log(results);
}

/**
 * Invokes the setTopicId function of the contract
 * @param contractId
 * @param address
 * @param topicId
 * @returns {Promise<void>}
 */
async function executeSetTopicIdMessage(contractId, address, topicId) {
    console.log(`\nCalling setTopicId function with parameter value:\naddress:'${address}'\ntopicId:'${topicId}'`);

    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('setTopicId',  [address, topicId]);

    // execute the transaction calling the set_message contract function
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100000)
        .execute(client);

    // get the receipt for the transaction
    await transaction.getReceipt(client);

    // a record contains the output of the function
    // as well as events, let's get events for this transaction
    const record = await transaction.getRecord(client);

    if(!record.contractFunctionResult) throw new Error(`record.contractFunctionResult is null`);

    // the events from the function call are in record.contractFunctionResult.logs.data
    // let's parse the logs using ethers.js
    // there may be several log entries
    record.contractFunctionResult.logs.forEach(log => getTransactionLogDetails(log));
}

/**
 * Invokes the getTopicId function of the contract using a query.
 * The getTopicId function doesn't mutate the contract's state, therefore a query can be used
 * @param contractId
 * @param address
 * @returns {Promise<void>}
 */
async function queryGetTopicIdMessage(contractId,address) {
    console.log(`\ngetTopicId Query`);
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('getTopicId', [address]);

    // query the contract
    const contractCall = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setQueryPayment(new Hbar(2))
        .setGas(100000)
        .execute(client);

    let results = abiInterface.decodeFunctionResult('getTopicId', contractCall.bytes);
    console.log(results);
}


/**
 * Gets all the events for a given ContractId from a mirror node
 * Note: To particular filtering is implemented here, in practice you'd only want to query for events
 * in a time range or from a given timestamp for example
 * @param contractId
 */

async function getEventsFromMirror(contractId) {
    console.log(`\nGetting event(s) from mirror`);
    console.log(`Waiting 10s to allow transaction propagation to mirror`);
    await delay(10000);

    const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId.toString()}/results/logs?order=asc`;

    // !Note: Type cast it based on best estimated observation. Might not be 100% accurate
    // Response sample in - https://testnet.mirrornode.hedera.com/api/v1/docs/#/contracts/listContractLogs
    // TODO: Use npx openapi-typescript https://testnet.mirrornode.hedera.com/api/v1/docs/openapi.yml --output types.d.ts
    // https://testnet.mirrornode.hedera.com/api/v1/docs/openapi.yml
    // https://www.npmjs.com/package/openapi-typescript
    axios.get<ContractsResultLog>(url)
        .then(function (response) {

            const jsonResponse = response.data;

            if(!jsonResponse.logs) throw new Error(`result logs from ${contractId.toString()} is null`);

            jsonResponse.logs.forEach(log=> {

                if(!log.data) throw new Error(`log data from ${contractId.toString()} is null`);
                if(!log.topics) throw new Error(`log topics from ${contractId.toString()} is null`);

                // convert the log.data (uint8Array) to a string
                const logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

                // get topics from log
                const logTopics: string[] = [];
                log.topics.forEach(topic => {
                    logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
                });

                // decode the event data
                const logRequest: LogStruct = {
                    data: logStringHex,
                    topics: logTopics
                };
                
                const event = abiInterface.parseLog(logRequest);

                console.log(event);
                
                // output the from address stored in the event
                // console.log(`Record event: from '${AccountId.fromString(event.args.from).toString()}' update to '${event.args.message}'`);
                // console.log(`Record event: from '${AccountId.fromEvmAddress(event.args.from).toString()}' update to '${event.args.message}'`);
            });

        })
        .catch(function (err) {
            console.error(err);
        });
}

/**
 * Helper function to encode function name and parameters that can be used to invoke a contract's function
 * @param functionName the name of the function to invoke
 * @param parameterArray an array of parameters to pass to the function
 */
function encodeFunctionParameters(functionName, parameterArray) {
    // build the call parameters using ethers.js
    // .slice(2) to remove leading '0x'
    const functionCallAsHexString = abiInterface.encodeFunctionData(functionName, parameterArray).slice(2);
    // convert to a Uint8Array
    return Buffer.from(functionCallAsHexString, `hex`);
}

function getTransactionLogDetails (log: ContractLogInfo){
    // convert the log.data (uint8Array) to a string
    const logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

    // get topics from log
    const logTopics: string[] = [];
    log.topics.forEach(topic => {
        logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
    });

    // decode the event data
    const logRequest: LogStruct = {
        data: logStringHex,
        topics: logTopics
    };
    
    const event = abiInterface.parseLog(logRequest);

    console.log(event);
    
    // output the from address stored in the event
    // console.log(`Record event: from '${AccountId.fromString(event.args.from).toString()}' update to '${event.args.message}'`);
    // console.log(`Record event: from '${AccountId.fromEvmAddress(event.args.from).toString()}' update to '${event.args.message}'`);
}

void main();