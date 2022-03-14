/* eslint-disable no-unused-vars */
import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "tsconfig-paths/register";
import { config as configEnv } from "dotenv";
import { utils } from "ethers";
import { task } from "hardhat/config";
import { HardhatUserConfig, SolcUserConfig } from "hardhat/types";
import { create } from "ipfs-http-client";

// eslint-disable-next-line node/no-path-concat
configEnv({ path: __dirname + "/.env" });
const { isAddress, getAddress, formatUnits, parseUnits } = utils;
const INFURA_PROJECT_ID = process.env.INFURA_PID;
const KOVAN_PRIVATE_KEY = process.env.KOVAN_KEY;
const MATIC_ID = process.env.POLYGON_MAINET;
const MUMBAI_ID = process.env.POLYGON_MUMBAI;
const PK = process.env.PK;
const PKUL = process.env.PKUL;
const ALCHEMY_PROJECT_ID = process.env.ALCHEMY_PROJECT_ID;
const FORKING_ID = process.env.FORKING_ID;
const defaultNetwork = "localhost";
const DEFAULT_COMPILER_SETTINGS: SolcUserConfig = {
  version: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: "none",
    },
  },
};
console.log(process.env.PKUL);
if (process.env.RUN_COVERAGE === "1") {
  /**
   * Updates the default compiler settings when running coverage.
   * See https://github.com/sc-forks/solidity-coverage/issues/417#issuecomment-730526466
   */
  console.info("Using coverage compiler settings");
  DEFAULT_COMPILER_SETTINGS.settings = {
    yul: true,
    yulDetails: {
      stackAllocation: true,
    },
  };
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const config: HardhatUserConfig = {
  // defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0,
    },
    sameUser: 1,
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: false,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PID}`,
      accounts: [`0x${PKUL}`],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    arbitrum: {
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECTT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    arbitrumrinkeby: {
      url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_PROJECTT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_PROJECTT_ID}`,
      accounts: [`0x${PKUL}`],
    },
    optimismrinkeby: {
      url: `https://optimism-kovan.infura.io/v3/${process.env.INFURA_PROJECTT_ID}`,
      accounts: [`0x${PKUL}`],
    },
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
  },
  contractSizer: {
    alphaSort: false,
    disambiguatePaths: true,
    runOnCompile: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "../ich1baapp/types/typechain",
  },

  //  gasReporter: {
  //   currency: 'USD',
  //   gasPrice: 100,
  //   enabled: process.env.REPORT_GAS ? true : false,
  //   // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  //   maxMethodDiff: 10,
  // },
  mocha: {
    timeout: 40000,
  },
  // typechain: {
  //   outDir: 'typechain',
  //   target: 'ethers-v5',
  // }
};

// if (process.env.ETHERSCAN_API_KEY) {
//   config.etherscan = {
//     // Your API key for Etherscan@ty@type
//     // Obtain one at https://etherscan.io/
//     apiKey: process.env.ETHERSCAN_API_KEY,
//   }
// }

export default config;

task("accounts", "Prints list default accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(await account.address);
  }
});
