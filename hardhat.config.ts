import type { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-truffle5";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "dotenv/config";

const zilliqaMainnet: NetworkUserConfig = {
  url: "https://api.zilliqa.com/",
  chainId: 1,
  accounts: [process.env.KEY_MAINNET!],
};

const zilliqaTestnet: NetworkUserConfig = {
  url: "https://dev-api.zilliqa.com/",
  chainId: 33101,
  accounts: [process.env.KEY_TESTNET!],
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    testnet: zilliqaTestnet,
    mainnet: zilliqaMainnet,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 100000000
  }
  // abiExporter: {
  //   path: "./data/abi",
  //   clear: true,
  //   flat: false,
  // },
};

export default config;
