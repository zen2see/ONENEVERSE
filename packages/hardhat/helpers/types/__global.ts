/* eslint-disable no-unused-vars */
/* eslint-disable node/no-missing-import */
// eslint-disable-next-line
import '@nomiclabs/hardhat-ethers';
import { ExternalProvider } from "@ethersproject/providers/src.ts/web3-provider";

export {};

declare global {
  interface hre {
    ethers: ExternalProvider;
  }
  interface Window {
    ethereum: ExternalProvider;
  }
}

export {};