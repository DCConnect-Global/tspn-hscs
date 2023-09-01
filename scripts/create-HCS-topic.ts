import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { AccountId, Client, PrivateKey, TopicCreateTransaction, TopicInfoQuery } from "@hashgraph/sdk";

const envFilePath = path.resolve(__dirname, '../.env.local')

dotenv.config({path : envFilePath });

const topicId = process.env.HEDERA_TOPIC_ID;
const topicIdEnvVariable = 'HEDERA_TOPIC_ID'; 
const invalidTopicIdMessage = 'INVALID_TOPIC_ID';
const client = Client.forTestnet();

async function checkTopicId() {

    try{
        if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
            throw new Error('OPERATOR_ID and OPERATOR_KEY must be set in .env.local');
        }

        // Create a new client instance
        client.setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );

        // Check if the topic ID is valid
        if (topicId) {
            const topicIdQuery = new TopicInfoQuery({topicId: topicId});
            const topicIdInfo = await topicIdQuery.execute(client).catch(e => {
                // console.log(e.message)
                if(e.message.includes(invalidTopicIdMessage)){
                    return null;
                }
            });

            if(topicIdInfo) console.log(`Existing topicId: ${topicIdInfo.topicId.toString()}`);
            
            // Create topic id if not exist using HCS SDK
            else await updateTopicId();

        } else {
            console.log(`Invalid topic id. Creating new topic id..`);
            await updateTopicId();
        }
    }
    catch(e: unknown) {
        console.error(e)
    } finally {
        client.close();
        process.exit();
    }
}

const updateTopicId = async () => {
    if (!fs.existsSync(envFilePath)) throw new Error(`${envFilePath} does not exist. Make sure ${envFilePath} is created at root directory.`);

    const topicId = await createTopicId();

    if(!topicId) throw new Error(`Failed to create topic id. Operation abort. Please retry.`);
    
    // Generate new topic Id and append to env variable
    const envFileContents = fs.readFileSync(envFilePath, 'utf8');
    // Create regex to cater for commented env variable [eg: # HEDERA_TOPIC_ID=]
    const topicIdEnvVariableRegex : RegExp = new RegExp(`\\s*#\\s*${topicIdEnvVariable}=\\w.*\\s*`,'g');
    
    // Overwrite existing topic id if exist
    if(envFileContents.includes(`${topicIdEnvVariable}=`)) fs.writeFileSync(envFilePath, envFileContents.replace(topicIdEnvVariableRegex, `\n${topicIdEnvVariable}=${topicId}`));
    // Append new topic id if not exist
    else fs.appendFileSync(envFilePath, `\n${topicIdEnvVariable}=${topicId}`);

    console.log(`Updated topic id: ${topicId}`);
}

const createTopicId = async () =>{
    const topicCreationTx = await new TopicCreateTransaction();
    const txResponse = await topicCreationTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    return receipt.topicId?.toString();
}

checkTopicId();
