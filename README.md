To Run this project -

after downloading the repo - Hardhat Smart contract part 

```shell

cd voting-contract

npm install

npx hardhat compile

npx hardhat test

npx hardhat run scripts/deploy.js --network sepolia

after deploying the contract on the sepolia network , private key and api key is mentioned in .env file

if you want to use your own api key and deployer account replace the private key in the .env file

```


To Run this project - Frontend part

after downloading the repo -

```shell

cd frontend

npm install

npx run dev

open the frontend in the localhost that can interact with the deployed contract on the sepolia network

```


