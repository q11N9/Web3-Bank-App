import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const Bank = await ethers.getContractFactory("Bank");
  const bank = await Bank.deploy();

  await bank.waitForDeployment();

  const address = await bank.getAddress();
  console.log("Bank deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});