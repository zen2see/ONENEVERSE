// This adds the type from hardhat runtime environment.
import { HardhatRuntimeEnvironment } from "hardhat/types";
// This adds the type that a deploy function is expected to fulfill.
// eslint-disable-next-line node/no-missing-import
import { DeployFunction } from "hardhat-deploy/types";
// the deploy function receives the hardhat runtime env as an argument
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // we get the deployments and getNamedAccounts which are provided by hardhat-deploy.
  const { deployments, getNamedAccounts } = hre;
  // The deployments field itself contains the deploy function.
  const { deploy } = deployments;
  // Fetch the accounts. These can be configured in hardhat.config.ts as explained above.
  // eslint-disable-next-line no-unused-vars
  const { deployer, contractOwner } = await getNamedAccounts();
  // This will create a deployment called 'ICH1BA'. By default it will look for an artifact with the same name.
  // The 'contract' option allows you to use a different artifact.
  await deploy("ONENEVERSE", {
    // Deployer will be performing the deployment transaction.
    from: deployer,
    // args[] is the address used as the first argument to the ICH1BA contract's constructor.
    args: [],
    log: true,
  });
};
export default func;
// This sets up a tag so you can execute the script on its own (and its dependencies).
func.tags = ["ONENEVERSE"];
