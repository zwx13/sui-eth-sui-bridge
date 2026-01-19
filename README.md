## Backend

This is the "brain", since the Ethereum and Sui blockchains cannot talk to each other directly

It uses **Node.js** and **Express**.

### How it works

The backend is a simple web server that listens for commands. It has two main jobs:

1.  **The Server (`index.js`):**
    This file just keeps the server running on port 3001. It waits for someone (using `curl`) to send a request saying "I want to move tokens."

2.  **The Logic (`bridge.js`):**
    TWhen a request comes in, this file checks if I want to go to Sui or to Ethereum.
    * **To Sui:** It uses the command line tools to talk to the Sui network and mint new IBT tokens.
    * **To Ethereum:** It uses a library called `ethers` to connect to my local blockchain (Anvil) and mint tokens there.

## Ethereum (Smart Contracts)

This folder contains the Solidity code for the Ethereum side of the bridge.

We used **Foundry** (specifically `anvil` and `forge`) to create and manage this part of the project.

### The Main Contract: `IBT.sol`
* It is a standard token; has `Ownable` permissions to it.
* It has `mint` and `burn` functions that **only the owner** (backend server) can call.

Regular users cannot just print free money; only the bridge can create tokens when they are transferred from the other chain.

## Sui (Smart Contract)

This folder contains the **Move** code for the Sui side of the bridge.

Unlike Ethereum, which uses Solidity, Sui uses a language called Move. This was done using the `sui move new` command.

### The Main Logic: `ibt.move`
This was non automatic; it defines the IBT token on the Sui blockchain.

It acts very similar to the Ethereum contract:
1.  **`init` function:** Sets up the token name and symbol when deployed it. Gives a`TreasuryCap`.
2.  **`TreasuryCap`:** This is like the admin key. Whoever owns this object has the power to mint and burn tokens.
3.  **`mint`:** backend uses this function to create tokens for users when they bridge from Ethereum.
4.  **`burn`:** backend uses this to destroy tokens when users want to leave Sui.

## Commands that we can use:
```
curl -X POST http://localhost:3001/eth-to-sui      -H "Content-Type: application/json"      -d "{\"amount\": \"100\", \"suiAddress\": \"$SUI_RECIPIENT\"}"

```
curl -X POST http://localhost:3001/sui-to-eth      -H "Content-Type: application/json"      -d "{\"amount\": \"50\", \"ethAddress\": \"$ETH_RECIPIENT\"}"
```


The other files like `Move.toml` are just configuration files that the Sui compiler generates automatically to manage dependencies.
