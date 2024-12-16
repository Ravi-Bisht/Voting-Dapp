const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const Voting = await ethers.getContractFactory("Voting");
  const candidates = ["Skipper", "Kowalski", "Rico" , "Private"];
  const durationInMinutes = 10;

  const voting = await Voting.deploy(candidates, durationInMinutes);

  await voting.waitForDeployment(); 

  console.log("Voting contract deployed to:", await voting.getAddress());

  const contractAddress = await voting.getAddress();

  const data = {
    address: contractAddress,
    deployer: deployer.address,
    network: await deployer.provider.getNetwork(),
  };

  fs.writeFileSync("./deployedContract.json", JSON.stringify(data, null, 2));
  console.log("Contract address saved to deployedContract.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
