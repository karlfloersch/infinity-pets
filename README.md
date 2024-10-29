## Infinity Pets

An example horizontally scalable smart contract system and frontend application.

The demo should:
1. Show what the chain abstracted UX could look like with a Superchain-native embedded wallet.
2. Demonstrate how TPS scales as new chains are deployed to the Superchain.
3. Show how a simplified version of SAP can be implemented on top!


## TODO
Here's the plan for today/tomorrow's hackathon:

- [x] Create frontend CREATE2 deployment & embedded wallet library -- This should be first because it will let me test the application super quickly.
- [x] Create simple counter app -- This will allow me to start testing reading and writing data onchain
- [x] Create an onchain function to spin up a new Supersim chain -- This should look like a local service which watches my local chain for a 'new chain' event and then based on that event, spins up a new Supersim instance with a deterministic RPC / chain ID.
- [x] Call this function in our frontend, so it becomes possible to deploy new chains via a tx -- This will be useful for showing the infinite scale
- [ ] Add a "spam" function which spams local chains with transactions & counts the TPS -- It should be clear that the number of txs you can spam increases with the number of chains you've got
- [ ] (actually build SAP) Write a function which generates the game state of (simplified) SAP based on messages posted in my Twitter clone -- It should read all the events for a particular Twitter topic and use it to generate a game state.
- [ ] Add a frontend which consumes game states and outputs a pretty UI -- Hopefully AI can do this for me


# Findings
* It seems WAGMI doesn't have great support for the kind of embedded wallet I wanted to use. My ideal is a Passkey based wallet.
* There is really terrible CREATE2 factory tooling. We need to implement a lot of helpers to get CREATE2 to be easy to use.
* ...more todo