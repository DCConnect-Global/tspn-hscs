
import {
    Client,
    ContractCreateTransaction, ContractExecuteTransaction, ContractCallQuery, 
    ContractLogInfo,
    FileCreateTransaction,
    ContractId,
} from "@hashgraph/sdk";

import { Interface } from "@ethersproject/abi";
import abi from "../src/contracts/abi";
import bytecode from "../src/contracts/bytecode";
import {paths} from '../types';
import axios from "axios";

type ContractsResultLog = paths['/api/v1/contracts/results/logs']['get']['responses'][200]["content"]["application/json"]


interface LogStruct {
    topics: Array<string>; 
    data: string;
}

const abiInterface = new Interface(abi);
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Deploys the contract to Hedera by first creating a file containing the bytecode, then creating a contract from the resulting
 * FileId, specifying a parameter value for the constructor and returning the resulting ContractId
 *  
 * @param client
 * @returns {Promise<ContractId>}
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

    // // Fetch the receipt for transaction that created the file
    const fileReceipt = await fileTransactionResponse.getReceipt(client);

    // The file ID is located on the transaction receipt
    const fileId = fileReceipt.fileId;

    if(!fileId) throw new Error(`fieldId is null`);

    // Check file content via fileId
    // const fileContent = await new FileContentsQuery({fileId}).execute(client);
    // console.log(fileContent.toString());

    // Comment out since contract doesn't require parameter for the time being
    // TODO: Uncomment if constructor parameters are required
    // get the constructor parameter
    // .slice(2) to remove leading '0x'
    // const constructParameterAsHexString = abiInterface.encodeDeploy([constructMessage]).slice(2);
    // convert to a Uint8Array
    // const constructorParametersAsUint8Array = Buffer.from(constructParameterAsHexString, 'hex');

    // Create the contract
    const contractTransaction = await new ContractCreateTransaction()
        // Set the parameters that should be passed to the contract constructor
        // using the output from the ethers.js library
        // .setConstructorParameters(constructorParametersAsUint8Array)
        // Set gas to create the contract
        .setGas(500_000)
        // The contract bytecode must be set to the file ID containing the contract bytecode
        .setBytecodeFileId(fileId)

    const contractTransactionResponse = await contractTransaction.execute(client);

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
 * @param client
 * @param contractId
 * @param address
 * @param spDid
 * @returns {Promise<void>}
 */
async function executeSetSpDidMessage(client: Client, contractId: ContractId, address: string, spDid:string) {
    console.log(`\nsetSpDid transaction`);
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('setSpDid',  [address, spDid]);

    // execute the transaction calling the set_message contract function
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100_000)
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
 * @param client
 * @param contractId
 * @param address
 * @returns {Promise<void>}
 */
async function queryGetSpDidMessage(client: Client, contractId: ContractId, address: string) {
    console.log(`\ngetSpDid Query`);
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('getSpDid', [address]);

    // query the contract
    const contractCall = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100_000)
        .execute(client);

    let results = abiInterface.decodeFunctionResult('getSpDid', contractCall.bytes);
    console.table(results);
}

/**
 * Invokes the getSpDid function of the contract using a transaction and uses the resulting record to determine
 * the returned value from the function.
 * Note: The getSpDid function doesn't mutate the contract's state, therefore a query could be used, but this shows how to
 * process return values from a contract function that does mutate contract state using a TransactionRecord
 * @param client
 * @param contractId
 * @param address
 * @returns {Promise<void>}
 */
async function executeGetSpDidMessage(client: Client, contractId: ContractId, address:string) {
    console.log(`\ngetSpDid transaction`);

    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('getSpDid', [address]);

    // doing the same with a transaction and a record
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100_000)
        .execute(client);

    // a record contains the output of the function
    const record = await transaction.getRecord(client);

    if(!record.contractFunctionResult) throw new Error(`record.contractFunctionResult is null`);

    // the result of the function call is in record.contractFunctionResult.bytes
    // let`s parse it using ethers.js
    const results = abiInterface.decodeFunctionResult('getSpDid', record.contractFunctionResult.bytes);
    console.table(results);
}

/**
 * Invokes the setTopicId function of the contract
 * @param client
 * @param contractId
 * @param topicId
 * @returns {Promise<void>}
 */
async function executeSetTopicIdMessage(client: Client, contractId:ContractId, topicId:string) {
    console.log(`\nsetTopicId transaction`);
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('setTopicId',  [topicId]);

    // execute the transaction calling the set_message contract function
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100_000)
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
 * @param client
 * @param contractId
 * @returns {Promise<void>}
 */
async function queryGetTopicIdMessage(client: Client, contractId:ContractId) {
    console.log(`\ngetTopicId Query`);
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('getTopicId', []);

    // query the contract
    const contractCall = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100_000)
        .execute(client);

    let results = abiInterface.decodeFunctionResult('getTopicId', contractCall.bytes);
    console.table(results);
}


/**
 * Gets all the events for a given ContractId from a mirror node
 * Note: To particular filtering is implemented here, in practice you'd only want to query for events
 * in a time range or from a given timestamp for example
 * @param contractId
 * @returns {Promise<void>}
 */

async function getEventsFromMirror(contractId: ContractId) {
    console.log(`\nGetting event(s) from mirror`);
    console.log(`Waiting 10s to allow transaction propagation to mirror`);
    await delay(10_000);

    const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId.toString()}/results/logs?order=asc`;

    // !Note: Type cast it based on best estimated observation. Might not be 100% accurate
    // Response sample in - https://testnet.mirrornode.hedera.com/api/v1/docs/#/contracts/listContractLogs
    // TODO: Use npx openapi-typescript https://testnet.mirrornode.hedera.com/api/v1/docs/openapi.yml --output types.d.ts
    // https://testnet.mirrornode.hedera.com/api/v1/docs/openapi.yml
    // https://www.npmjs.com/package/openapi-typescript
    await axios.get<ContractsResultLog>(url)
        .then(function (response) {

            const jsonResponse = response.data;

            if(!jsonResponse.logs) throw new Error(`result logs from ${contractId.toString()} is null`);

            jsonResponse.logs.forEach(log=> {

                if(!log.data) throw new Error(`log data from ${contractId.toString()} is null`);
                if(!log.topics) throw new Error(`log topics from ${contractId.toString()} is null`);
                if(!log.bloom) throw new Error(`log bloom from ${contractId.toString()} is null`);
                if(!log.contract_id) throw new Error(`log contract_id from ${contractId.toString()} is null`);


                // !Note: This is used to transform log from http response of mirror node to ContractLogInfo
                // const contractLog: ContractLogInfo = new ContractLogInfo({contractId: ContractId.fromString(log.contract_id), bloom: Buffer.from(log.bloom), topics:log.topics.map(topic => Buffer.from(topic)), data:Buffer.from(log.data)})


                // decode the event data
                const logRequest: LogStruct = {
                    data: log.data,
                    topics: log.topics
                };
                
                const event = abiInterface.parseLog(logRequest);

                // output the from address stored in the event
                console.table(event.args)
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
 * @returns {Buffer}
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
    
    // output the from address stored in the event
    console.table(event.args)
}

export {
    deployContract,
    executeSetSpDidMessage,
    queryGetSpDidMessage,
    executeGetSpDidMessage,
    executeSetTopicIdMessage,
    queryGetTopicIdMessage,
    getEventsFromMirror
}