# PlunderSwap Core Protocol

## Requirement

`node@>=18`

## Install dependencies

`yarn`

## Enter private keys for deployment

`cp .env.sample .env`

## Compile contracts

`yarn compile`

## Run tests

`yarn test`

## Deploy contracts

```
yarn deploy:testnet
yarn deploy:mainnet
```

## Verifying contracts on sourcify.dev
`npx hardhat --network testnet verify-sourcify --contract PlunderFactory --address 0xd0156eFCA4D847E4c4aD3F9ECa7FA697bb105cC0`