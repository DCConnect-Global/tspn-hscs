# Exemplar for TSPN Hedera and Metamask Integration

## Overview

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and modified with additional dependencies for smart contract deployment and unit test of contract interaction with Hedera blockchain.

The main task of the smart contract is to emulate `governance DAO` that maintain a curated **list of service provider [DIDs](https://www.w3.org/TR/did-core/#dfn-decentralized-identifiers)** and the **canonical topic id** that is created via [Hedera Consensus Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service/create-a-topic).

In the event of `canonical topic id` in smart contract become invalid, it can be updated to reflect the latest changes on the `canonical topic id` with procedures as followed:
- Detect **invalid topic id** error message while using `canonical topic id` retrieved from smart contract 
- Verify that stored `canonical topic id` in smart contract is invalid
- Report incident to DAO and committee members for further actionable plan
- Authorized user(s) to create **new topic id** via `Hedera Consensus Service`
- Authorized user(s) will update `canonical topic id` in smart contract with **newly created topic id** 

> **Note**
> At the current stage, smart contract does not implement any role-based access control or restrictive access modifier on `update canonical topic id` function for simplicity sake.
> **This note should be deleted upon the implementation is complete** 

> **Important**
> Any changes in smart contract (`.sol`) have to be compiled in  [Remix - Ethereum IDE](https://remix.ethereum.org/) with compiler that is supported by [Hedera Smart Contract Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/smart-contracts/create-a-smart-contract).
> Upon successful compilation, copy `abi` and `bytecode` from **Remix** to `abi.ts` and `bytecode.ts` in **contracts** folder respectively.

> **Note**
> Incorporates https://github.com/ed-marquez/hedera-example-metamask-counter-dapp.git
> A Hedera - Metamask example app, but converted to typescript (and ethers v6)

> **Note**
> `contracts` folder from **Create React App** is relocated to root project directory to cater for hardhat configuration that is used for `contract deployment` and `unit test`

## Pre-requisite 
- Install [Node.js](https://nodejs.org/en/download) preferably via `nvm` 
- Install [pnpm](https://pnpm.io/installation) preferably with `corepack`
- At root project directory, run `pnpm i` to install necessary project dependencies.
- At root project directory, copy `.env.example` and rename to `.env.local`. Fill in the environment variable as [shown here](https://docs.hedera.com/hedera/tutorials/smart-contracts/deploy-a-smart-contract-using-hardhat#environment-variables) and [here](https://docs.hedera.com/hedera/tutorials/smart-contracts/hscs-workshop/setup#step-b2-operator-account).

## Scripts

In the project directory, you can run:

### `pnpm create-HCS-topic`

Check `.env.local` and create valid `HEDERA_TOPIC_ID` if not yet exists or invalid.
Otherwise, it will print out existing valid `HEDERA_TOPIC_ID` in console window.

### `pnpm test-solidity`

Launches the hardhat test runner with configuration from `hardhat.config.ts` and `tsconfig.json` .


---
## React Scripts

In the project directory, you can run:

### `pnpm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `pnpm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `pnpm build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `pnpm eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

