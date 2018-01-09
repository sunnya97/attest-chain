# attest-chain

## Dependencies
The major package requirements for this project (That I'm aware of) are:
- Node.js
  - https://www.npmjs.com/get-npm
- geth
  - https://ethereum.github.io/go-ethereum/install/
- solc
  - http://solidity.readthedocs.io/en/develop/installing-solidity.html

Once those are installed you'll need to run `npm install` to pull down the
Node.js dependencies, and from there you can go a number of different ways.
If you'd like to avoid buying/mining ethereum you can create a local test
blockchain with either `make local-test-chain` or
`npm run-script createLocalTestChain` otherwise you can choose to configure things yourself to use the slow, expensive blockchain.

Additionally, depending on whether your command line responds to solc or solcjs (from an npm install), modify the Makefile.
You should 'make clean' and then 'make abi.json' before running your code. 

## Running
To start the server you can either execute `startServer.sh` or `npm start`, and after that you should have a real live server running in console mode for your development pleasure.

## Testing
run `node test.js` to run the test script
