import { ethers, network, run } from "hardhat";

const main = async () => {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  // Sanity checks
  if (networkName === "mainnet") {
    if (!process.env.KEY_MAINNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  } else if (networkName === "testnet") {
    if (!process.env.KEY_TESTNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  }

  const [deployer] = await ethers.getSigners();

  console.log("Deploying to network:", networkName);

  console.log("Deploying AbbikaFactory..");
  const abbikaFactory = await ethers.getContractFactory("AbbikaFactory");
  const factory = await abbikaFactory.deploy(deployer.address);
  await factory.deployed();

  console.log("AbbikaFactory deployed to:", factory.address);

  console.log("Deploying Wrapped ZIL..");
  const wrappedZIL = await ethers.getContractFactory("WZIL");
  const wzil = await wrappedZIL.deploy();
  await wzil.deployed();

  console.log("Wrapped ZIL deployed to:", wzil.address);

  console.log("Deploying AbbikaRouter..");
  const abbikaRouter = await ethers.getContractFactory("AbbikaRouter");
  const router = await abbikaRouter.deploy(factory.address, wzil.address);
  await router.deployed();

  console.log("AbbikaRouter deployed to:", router.address);
  

  // Deploy AbbikaZapV1
  console.log("Deploying AbbikaZap V1..");

  const AbbikaZapV1 = await ethers.getContractFactory("AbbikaZapV1");

  const abbikaZap = await AbbikaZapV1.deploy(
    wzil.address,
    router.address,
    50
  );

  await abbikaZap.deployed();

  console.log("AbbikaZap V1 deployed to:", abbikaZap.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
