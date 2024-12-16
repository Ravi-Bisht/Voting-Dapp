To Run this project -

after downloading the repo -

```shell

cd voting-contract

npm install

npx hardhat compile

npx hardhat test

npx hardhat run scripts/deploy.js --network sepolia

after deploying the contract on the sepolia network , private key and api key is mentioned in .env file

if you want to use your own api key and deployer account replace the private key in the .env file

```
