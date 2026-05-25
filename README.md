# Web3 Bank App

Web3 Bank App is a local dApp project for learning how a frontend application interacts with a Solidity smart contract through MetaMask and a local Ethereum-compatible blockchain such as Ganache.

The project simulates a simple bank contract where a user can connect a wallet, deposit test ETH into the smart contract, withdraw test ETH from the smart contract, and view both personal bank balance and total contract balance.

> This project is for learning and local testing only. It is not intended for production or mainnet deployment.

## Features

- Connect MetaMask wallet
- Display connected wallet address
- Display wallet ETH balance
- Deposit test ETH into the Bank smart contract
- Withdraw test ETH from the Bank smart contract
- Display user balance stored in the Bank contract
- Display total ETH stored in the Bank contract
- Display latest transaction hash after deposit or withdraw

## Project Architecture

```text
User Browser
    |
    v
React Frontend
    |
    v
MetaMask
    |
    v
Ganache Local Blockchain
    |
    v
Bank.sol Smart Contract
```

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.20 |
| Blockchain Development | Hardhat 3 |
| Local Blockchain | Ganache |
| Frontend | React + Vite |
| Web3 Library | ethers.js v6 |
| Wallet | MetaMask |
| Runtime | Node.js |

## Repository Structure

```text
Web3-Bank-App/
├── backend/
├── contracts/
│   └── Bank.sol
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── scripts/
├── hardhat.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Smart Contract Overview

The main smart contract is `Bank.sol`.

Main functions:

```solidity
function deposit() external payable;
function withdraw(uint256 amount) external;
function getMyBalance() external view returns (uint256);
function getContractBalance() external view returns (uint256);
```

### Contract Logic

- `deposit()` allows a user to send ETH into the Bank contract.
- `withdraw(amount)` allows a user to withdraw ETH if their internal Bank balance is sufficient.
- `getMyBalance()` returns the caller's balance stored inside the Bank contract.
- `getContractBalance()` returns the total ETH currently held by the Bank contract.

When a user deposits ETH, the ETH is transferred from the user's wallet to the smart contract address. The contract then records the deposited amount in a mapping:

```solidity
mapping(address => uint256) private balances;
```

## Prerequisites

Install the following tools before running the project:

- Node.js 22 or later
- npm
- Git
- Ganache
- MetaMask browser extension
- Chrome, Edge, or another browser that supports MetaMask

Check Node.js and npm versions:

```bash
node -v
npm -v
```

## Installation

Clone the repository:

```bash
git clone https://github.com/q11N9/Web3-Bank-App.git
cd Web3-Bank-App
```

Install root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

## Ganache Setup

Open Ganache and create or open a workspace.

Recommended network configuration:

```text
RPC URL: http://127.0.0.1:7545
Chain ID: 1337
Currency Symbol: ETH
```

If Ganache is running on the host machine while the project runs inside a virtual machine, use the host IP address instead of `127.0.0.1`.

Example:

```text
RPC URL: http://192.168.240.1:7545
Chain ID: 1337
```

## MetaMask Setup

Add a custom network in MetaMask:

```text
Network Name: Ganache Local
RPC URL: http://192.168.240.1:7545
Chain ID: 1337
Currency Symbol: ETH
```

Then import one Ganache account into MetaMask:

1. Open Ganache.
2. Click the key icon next to an account.
3. Copy the private key.
4. Open MetaMask.
5. Select `Import account`.
6. Paste the private key.
7. Switch to the imported account.

The imported account should show test ETH from Ganache.

## Hardhat Configuration

The project uses Hardhat 3 with ESM configuration.

Example `hardhat.config.ts`:

```ts
import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.20",
    settings: {
      evmVersion: "paris",
    },
  },
  networks: {
    ganache: {
      type: "http",
      url: "http://192.168.240.1:7545",
      chainId: 1337,
    },
  },
});
```

The `evmVersion: "paris"` setting is used to avoid compatibility issues with Ganache versions that do not support newer EVM opcodes.

## Compile Smart Contract

From the project root:

```bash
npx hardhat compile
```

## Deploy Smart Contract

Make sure Ganache is running first.

Deploy to Ganache:

```bash
npx hardhat run scripts/deploy.js --network ganache
```

After deployment, Hardhat will print the contract address:

```text
Bank deployed to: 0x...
```

Copy this address and update the frontend contract address file.

Example:

```json
{
  "Bank": "0xYourBankContractAddress"
}
```

## Copy ABI to Frontend

After compiling the contract, copy the generated ABI to the frontend:

```bash
cp artifacts/contracts/Bank.sol/Bank.json frontend/src/abi/Bank.json
```

## Run Frontend

From the `frontend` directory:

```bash
cd frontend
npm run dev
```

If you are running the frontend inside a virtual machine and opening it from the host machine, run:

```bash
npm run dev -- --host 0.0.0.0
```

Then open the network URL shown by Vite, for example:

```text
http://192.168.240.x:5173
```

## Usage Flow

1. Start Ganache.
2. Make sure MetaMask is connected to Ganache Local.
3. Import a Ganache account into MetaMask.
4. Compile the contract.
5. Deploy the contract.
6. Update the frontend contract address.
7. Start the frontend.
8. Open the dApp in a browser with MetaMask installed.
9. Click `Connect Wallet`.
10. Enter an ETH amount.
11. Click `Deposit`.
12. Confirm the transaction in MetaMask.
13. Check updated wallet balance, Bank balance, and contract balance.
14. Test `Withdraw` by entering an amount and confirming the transaction.

## Example Result

After depositing `1 ETH`:

```text
Wallet ETH balance: 98.99... ETH
Your Bank balance: 1.0 ETH
Contract total balance: 1.0 ETH
Status: Deposit successful
Last transaction: 0x...
```

The deposited ETH is stored at the Bank smart contract address, while the user's internal balance is recorded in the contract mapping.

## Notes

- This project uses test ETH only.
- Do not deploy this contract directly to mainnet.
- Do not use real private keys for local testing.
- Ganache private keys are for local development only.
- If Ganache workspace is reset, contract addresses and account states may change.
- After redeploying the contract, update the frontend contract address again.

## Common Errors

### MetaMask is not installed

This means the dApp was opened in a browser without MetaMask.

Solution:

- Open the frontend in Chrome or Edge where MetaMask is installed.
- If frontend runs inside a VM, start Vite with:

```bash
npm run dev -- --host 0.0.0.0
```

Then open the VM network URL from the host browser.

### Wallet shows 0 ETH

This usually means the current MetaMask account is not a Ganache account.

Solution:

- Import a Ganache private key into MetaMask.
- Switch to the imported account.

### Cannot connect to Ganache

If coding inside a VM and Ganache runs on the host machine, do not use `127.0.0.1` inside the VM.

Use the host IP address instead:

```text
http://192.168.240.1:7545
```

### Invalid opcode during deployment

This can happen when the compiled Solidity bytecode uses newer EVM opcodes unsupported by the current Ganache hardfork.

Solution:

Use this setting in `hardhat.config.ts`:

```ts
solidity: {
  version: "0.8.20",
  settings: {
    evmVersion: "paris",
  },
}
```

## Educational Purpose

This project is designed to help understand:

- How Web3 frontend connects to MetaMask
- How MetaMask signs transactions
- How a React app calls Solidity functions
- How ETH is deposited into a smart contract
- How smart contracts store user balances
- How Ganache records blocks and transactions
- How Hardhat compiles and deploys contracts

## License

This project is for educational use.
