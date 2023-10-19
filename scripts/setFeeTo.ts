import { ethers, network, run } from "hardhat";

const main = async () => {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  // Sanity checks
  if (networkName === "mainnet") {
    if (!process.env.KEY_MAINNET) {
      throw new Error(
        "Missing private key, refer to README 'Deployment' section"
      );
    }
  } else if (networkName === "testnet") {
    if (!process.env.KEY_TESTNET) {
      throw new Error(
        "Missing private key, refer to README 'Deployment' section"
      );
    }
  }

  const [deployer] = await ethers.getSigners();

  console.log("Deploying to network:", networkName);

  console.log("Retrieving PlunderFactory..");
  const plunderFactory = await ethers.getContractFactory("PlunderFactory");
  const factory = await plunderFactory.attach("x");

  const tx = await factory.setFeeTo("x");
  console.log("Transaction hash:", tx.hash);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
