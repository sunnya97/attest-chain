#!/bin/bash
#well ok, technically a console, but I like my servers interactive
geth --datadir ./localTestNet/localNetDataDir --rpccorsdomain="*" \
--nodiscover --maxpeers 0 --rpc --rpcapi "db,eth,net,web3" --rpcport "8545" \
 --identity "TestnetMainNode" --port "30303" --networkid 1999 console
