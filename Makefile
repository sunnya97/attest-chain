build: abi.json

abi.json: contracts/attestchain.sol
	solc --abi ./contracts/attestchain.sol | tail -1 > abi.json

clean: clean-abi

clean-abi:
	rm abi.json

local-test-chain: localTestNet/localNetDataDir/geth/makeHack

#generates local test chain
localTestNet/localNetDataDir/geth/makeHack: localTestNet/CustomGenesis.json
	rm -rf ./localNetDataDir/geth
	geth --datadir ./localTestNet/localNetDataDir --rpccorsdomain="*"\
	--nodiscover --maxpeers 0 --rpc --rpcapi "db,eth,net,web3" --rpcport "8545" \
	--identity "TestnetMainNode" --port "30303" --networkid 1999 \
	init localTestNet/CustomGenesis.json
	touch localTestNet/localNetDataDir/geth/makeHack

clean-local-test-chain:
	rm -rf ./localTestNet/localNetDataDir/geth
