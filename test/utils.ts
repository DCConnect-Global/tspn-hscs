
import {
    Client,
    ContractExecuteTransaction, ContractCallQuery, 
    ContractLogInfo,
    ContractId,
    ContractCreateFlow,
} from "@hashgraph/sdk";

import { Interface } from "@ethersproject/abi";
import abi from "../src/contracts/abi";
import bytecode from "../src/contracts/bytecode";
import {paths} from '../types';
import axios from "axios";

type ContractsResultLog = paths['/api/v1/contracts/results/logs']['get']['responses'][200]["content"]["application/json"]

interface ServiceProvider {
    _address: string;
    _name: string;
    _did: string;
    _nonce: number;
}

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

    const contractCreateTx = new ContractCreateFlow()
    .setGas(500_000)
    .setBytecode(bytecode);

    const contractCreateTxResponse = await contractCreateTx.execute(client);

    // Fetch the receipt for the transaction that created the contract
    const contractReceipt = await contractCreateTxResponse.getReceipt(client);

    // The contract ID is located on the transaction receipt
    const contractId = contractReceipt.contractId;

    if(!contractId) throw new Error(`contractId is null`);

    console.log(`new contract ID: ${contractId.toString()}`);
    return contractId;
}

/**
 * Invokes the grantMembership function of the contract
 * @param client
 * @param contractId
 * @param address
 * @param serviceProvider
 * @returns {Promise<void>}
 */
async function executeGrantMembershipMessage(client: Client, contractId: ContractId | string, serviceProvider: ServiceProvider): Promise<void> {
    console.log(`\ngrantMembership transaction`);
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('grantMembership',  [serviceProvider]);

    // execute the transaction calling the set_message contract function
    const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(200_000)
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
 * Invokes the getMember function of the contract using a query.
 * The getMember function doesn't mutate the contract's state, therefore a query can be used
 * @param client
 * @param contractId
 * @param did
 * @returns {Promise<void>}
 */
async function queryGetMemberMessage(client: Client, contractId: ContractId | string, did: string) {
    console.log(`\ngetMember Query`);
    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('getMember', [did]);

    // query the contract
    const contractCall = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setGas(100_000)
        .execute(client);

    let results = abiInterface.decodeFunctionResult('getMember', contractCall.bytes);
    console.log(results);
}

/**
 * Invokes the getMember function of the contract using a transaction and uses the resulting record to determine
 * the returned value from the function.
 * Note: The getMember function doesn't mutate the contract's state, therefore a query could be used, but this shows how to
 * process return values from a contract function that does mutate contract state using a TransactionRecord
 * @param client
 * @param contractId
 * @param did
 * @returns {Promise<void>}
 */
async function executeGetMemberMessage(client: Client, contractId: ContractId | string, did:string) {
    console.log(`\ngetMember transaction`);

    // generate function call with function name and parameters
    const functionCallAsUint8Array = encodeFunctionParameters('getMember', [did]);

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
    const results = abiInterface.decodeFunctionResult('getMember', record.contractFunctionResult.bytes);
    console.log(results);
}

/**
 * Invokes the setTopicId function of the contract
 * @param client
 * @param contractId
 * @param topicId
 * @returns {Promise<void>}
 */
async function executeSetTopicIdMessage(client: Client, contractId:ContractId | string, topicId:string) {
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
async function queryGetTopicIdMessage(client: Client, contractId: ContractId | string) {
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

async function getEventsFromMirror(contractId: ContractId | string) {
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
                console.log(event.args)
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
    console.log(event.args)
}

export {
    ServiceProvider,
    deployContract,
    executeGrantMembershipMessage,
    queryGetMemberMessage,
    executeGetMemberMessage,
    executeSetTopicIdMessage,
    queryGetTopicIdMessage,
    getEventsFromMirror
}