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