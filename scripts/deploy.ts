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

  console.log("Deploying PlunderFactory..");
  const plunderFactory = await ethers.getContractFactory("PlunderFactory");
  const factory = await plunderFactory.deploy(deployer.address);
  await factory.deployed();

  console.log("PlunderFactory deployed to:", factory.address);

  console.log("Deploying Wrapped ZIL..");
  const wrappedZIL = await ethers.getContractFactory("WZIL");
  const wzil = await wrappedZIL.deploy();
  await wzil.deployed();

  console.log("Wrapped ZIL deployed to:", wzil.address);

  console.log("Deploying PlunderRouter..");
  const plunderRouter = await ethers.getContractFactory("PlunderRouter");
  const router = await plunderRouter.deploy(factory.address, wzil.address);
  await router.deployed();

  console.log("PlunderRouter deployed to:", router.address);

  // Deploy PlunderZapV1
  console.log("Deploying PlunderZap V1..");

  const PlunderZapV1 = await ethers.getContractFactory("PlunderZapV1");

  const plunderZap = await PlunderZapV1.deploy(
    wzil.address,
    router.address,
    50
  );

  await plunderZap.deployed();

  console.log("PlunderZap V1 deployed to:", plunderZap.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
