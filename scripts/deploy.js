import { network } from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const { ethers } = await network.connect();

  const Bank = await ethers.getContractFactory("Bank");
  const bank = await Bank.deploy();

  await bank.waitForDeployment();

  const address = await bank.getAddress();

  console.log("Bank deployed to:", address);

  const projectRoot = process.cwd();

  const contractAddressDir = path.join(
    projectRoot,
    "frontend",
    "src",
    "contracts"
  );

  const contractAddressPath = path.join(
    contractAddressDir,
    "contract-address.json"
  );

  fs.mkdirSync(contractAddressDir, { recursive: true });

  const addressData = {
    Bank: address,
  };

  fs.writeFileSync(
    contractAddressPath,
    JSON.stringify(addressData, null, 2)
  );

  console.log("Updated frontend contract address:");
  console.log(contractAddressPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});