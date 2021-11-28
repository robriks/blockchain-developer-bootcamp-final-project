# A Peer-to-Peer Marketplace dApp for NFTs representing physical-world instruments using IPFS and secure escrow on the Ethereum blockchain
##### by robriks 
github.com/robriks/blockchain-developer-bootcamp-final-project
#### My Ethereum address: 
##### 👦🏻👦🏻.eth / hornosexual.eth / 0x65b54A4646369D8ad83CB58A5a6b39F22fcd8cEe
Feel free to send my certification as an NFT to any one of the above addresses if I pass (they all route to the same place)
##### Link to dApp front-end interface: https://blockchain-developer-bootcamp-final-project-robriks.vercel.app/ 

##### The Horn NFT Marketplace can be found on the Rinkeby Ethereum testnet at the following address:
0xB797e439Af1C850e84a32Ea1b100314972D35e19

Also viewable on Rinkeby etherscan: 
https://rinkeby.etherscan.io/address/0xB797e439Af1C850e84a32Ea1b100314972D35e19

## Project Description:
A full-stack dApp featuring a Horn Marketplace that allows classical musicians to mint their instruments as unique NFTs with verifiable, immutable ownership records. Each instrument NFT features an accompanying image that is uploaded to IPFS for decentralized image storage to match the ethos and strengths of blockchains as decentralized computer architectures. These NFTs can be bought and sold in a trustless peer-to-peer exchange via an escrow smart contract that is instantiated by the Marketplace contract and safeguards funds until the entire sale process, including shipping, is completed. Once minted and listed for sale, purchasing, shipping, and transferring NFT ownership on delivery is secured by rigorous access control and does not rely on any intermediary or require any trust at any step. A more in-depth write-up can be found at the bottom of this document.

### Local Setup Instructions:
The fully functional dApp is live at the front-end link above, which interacts with the marketplace contract on Rinkeby testnet. If you are just trying out the already-deployed dApp for fun or for grading, skip this section. However if you would like to play around with this project locally follow these instructions:
#### Clone the repo:
```
git clone https://github.com/robriks/blockchain-developer-bootcamp-final-project
```

#### Navigate to root directory and install dependencies for the dApp to function:
In the project's root directory, run 
```
npm install
```
Note that this command will need to be run again later inside the truffle-test-inside-this-directory to run the 46 accompanying unit tests.

#### Reconfigure Hardhat to work locally instead of the default Rinkeby testnet settings:

Open the hardhat.config.js file in the project root directory and comment out lines 3-4, line 10, and lines 15-18. This will prevent Hardhat from attempting to communicate with Rinkeby and instead use the local blockchain you're about to start running in the next step.

#### Start a local blockchain using the Hardhat dependency you just installed:
```
npx hardhat node
```

#### Important: Common troubleshooting error
This project was developed using Node version 16.9.0. If the above command returns an error, like a JSON-RPC error or HH604, it means that your version of Node is either too recent or too old to work with HardHat. Node version 17.x introduced an ssl connection that currently breaks HardHat. In this case, follow these steps to use a supported Node version:

##### Check your version of Node using `node -v`

##### Switch to a version of Node that is supported by using your preferred node version manager.
Either npm's n package or nvm will do. If you're not familiar with these tools, install npm n as it is easier to work with by running (with sudo):
```
sudo npm install -g n
```
And then install Node version 16.9.0:
```
sudo n 16.9.0
```

##### Now run the `npx hardhat node` command from before again, and HardHat will use node version 16.9.0 to start your local blockchain

#### Import buyer and seller accounts from HardHat
Grab the private keys of the first two accounts provided by the Hardhat node you just started and import both into MetaMask with the "Import Account" button under the Accounts tab. These accounts are your buyer and seller addresses, provided with 10000 test ETH by default.

#### Deploy HornMarketplace.sol to your localhost network using --network
In a new terminal, run the deployment script to deploy the marketplace contract on localhost network (this network must be specified as the default is currently set to Rinkeby in the hardhat.config.js file):
```
npx hardhat run --network localhost scripts/deploy.js
```

#### Start the front-end:
```
npm run dev
```
#### Open your localhost port 3000 and enjoy the horn marketplace! 
Make sure to use two metamask accounts as instructed when using the marketplace, a seller account and a buyer account since the marketplace will not allow you to purchase your own listings and will appear differently to each user depending on whether they are a seller or buyer.

### How to run the project's Solidity tests:
Important Note: Even though the main structure of the project is built using Hardhat, the tests are written in Solidity and must be tested using Truffle.  To do so, navigate to the "truffle-test-inside-this-directory" folder and run 
```
npm install
```
in order to install the testing dependencies which will enable the
```
truffle test
```
command that will compile and run Solidity tests on a temporary test blockchain provided by Truffle behind the scenes at port 9545. If you prefer to test against a custom local blockchain, you may uncomment lines 44-50 in the "truffle-config.js" file within "truffle-test-inside-this-directory" and use the specified port 7545 (or change it to whatever port you like). For grading purposes, running `truffle test` inside "truffle-test-inside-this-directory" should suffice.  

IMPORTANT: This means `npx hardhat test` will NOT compile or properly run the tests (there is not even the standard "test" directory).

Instead, navigate into the directory named: "truffle-test-inside-this-directory" and then run `truffle test` to execute (and grade :) ) my 46 passing tests. This MUST be the command used to run the Solidity test files in the truffle-test-inside-this-directory folder, because they rely on Truffle and NOT Hardhat like the rest of the project. I understand this is a bit unusual and inconvenient but given the time constraints for the final project due date and the fact that I have thus shown competence in building a dapp using two frameworks, both Truffle and Hardhat.

Why use both Truffle and Hardhat?  Since there was more recent documentation available, I decided to use Hardhat to develop my front-end after originally having written my contracts and tests using Truffle. I originally chose to use Truffle to write Solidity tests because I wanted to really delve into Solidity as a language to become fluent in it as fast as possible. After having migrated to Hardhat, and halfway through working on my front-end, I belatedly realized that Hardhat does not support Solidity tests. Since Hardhat does not support tests written in Solidity, this project instead includes a nested truffle project to run the Solidity tests from.

### Interacting with the dApp
First, in the root directory, ensure that configurations are properly set by populating the .secret file and the .env file (which are both protected by .gitignore). Do this by pasting the private key to your Rinkeby testnet account into the .secret file and by pasting your Infura Rinkeby API key into the .env file. To use multiple accounts with individual private keys, create a new file with its respective privateKey const declaration in the hardhat.config.js file, similar to the original .secret file. If you fork this repo, be sure to add any additional .secret2/3/4 etc files to .gitignore before pushing to GitHub.

##### When trying out the dApp:
Because this dApp is a marketplace, my implementation of the smart contract restricts behaviors to two separate classes of users: buyers and sellers, assigned on a per-instrument basis at time of listing and at purchase. Therefore, to properly interact with the dApp, you MUST use two MetaMask accounts to simulate both a seller and a buyer. The front-end also differentiates between these two classes by reading your MetaMask address and only displaying active purchases and sales that are relevant to you for actions like shipping or claiming depending on whether you have listed, paid for, sold, or shipped an instrument. Keep track of which address is a buyer/seller as you cycle between the front-end components and at what stage (minted, listed, paidfor, sold, shipped, delivered) the transaction is at, so you can fully appreciate the marketplace's functionality!

##### For your security: 
If you choose to use your own endpoints or private keys, be sure to only add Infura account details, MetaMask mnemonics, any private keys, etc., to the .env and .secret files, which will be injected into the Horn Marketplace dApp through Infura/MetaMask privately and securely. This file is protected by a .gitignore in the project locally so that your private keys are NEVER uploaded to the blockchain or to GitHub by git tracking.

##### Screencast Walkthrough:
A screencast of a project walkthrough is available here:
https://www.loom.com/share/ff4c61629acf4bfbb1d1c007c9c5f44f

### Full-length Writeup:

##### My inspiration:
As a hornist with the National Symphony Orchestra in Washington, DC, I have intimate familiarity with the inefficiencies of the global French Horn market under legacy systems. (Note: these inefficiencies also permeate the classical music industry at large, however I have chosen to focus my efforts on the global horn market as this is my area of expertise. Future endeavors may expand this scope to other instrument markets.)

##### The problem:
These inefficiencies have grown to an unconscionable level, where rent-takers and middlemen abuse their positions in the market (by way of audience reach & trust) to extract large profit margins (10%-20%) from sellers and, by inflating prices across the market via said commissions, from buyers as well. For example, the three largest French horn consignment sellers in the United States, PopeRepair, Houghton Horns, and Wichita Band all charge between 12-20% for people to sell their instruments through their consignment program. These margins on instruments that range from $3000 to $20000 place an oversized burden on sellers and artificially inflate prices in the used horn market, harming buyers.

#### The solution:
Blockchain smart contracts, specifically on Ethereum, are uniquely positioned to disintermediate these consignment platforms by automating instrument sales via escrow of cryptographically unique Non-Fungible-Tokens (ERC721s) that represent each instrument. Tokenized real-world assets can provide a transparent, immutable, and verifiable record of who owns an instrument and the time of purchase/transfer in order to alleviate an inefficient market currently rife with excessive consignment fees, scams, and financial fraud.

##### The process:
First a seller mints an NFT of the musical item they would like to sell, which a buyer then purchases by depositing Eth into the escrow smart contract instantiated by the marketplace, which locks the funds until the seller has shipped the item to the buyer. Once the physical instrument is delivered, the buyer then calls a function that claims ownership of the NFT, updating the immutable record of instrument ownership, and simulatneously releases the funds from escrow to the seller, completing the sale.

##### Advantages:
-Since horns NFTs' ownership history is tamper-proof, they can easily be verified on the blockchain; this is important because some instruments were owned and played by historically significant musicians (like classical music celebrities) and their value may be appraised accordingly. -This process of automated escrow with access control prevents commonplace instrument scams which are prevalent on such platforms as Ebay, Etsy, Alibaba, and the like through check bounces or other financial fraud schemes.

##### Disadvantages:
-Since the instruments are not digital assets, much of the process must be carried out off-chain. 
-The usual pseudonymity of the crypto economy is relinquished, seeing as musicians generally don't want to operate in a trustless environment by selling to an internet stranger and would much rather openly communicate/negotiate with buyers. Luckily web3 features transparency and makes this easy.

##### TL;DR:

###### 1. Seller -> Marketplace contract                 
Mints/lists NFT representing physical instrument, using website frontend to communicate horn model/serialNum/other data to the blockchain
###### 2. Buyer -> Marketplace dApp & contract           
Deposits & locks funds in escrow to buy instrument and provide proof of payment
###### 3. Seller -> USPS & Marketplace contract 
Ships physical instrument to seller and calls a function to mark the NFT as shipped
###### 4. Buyer -> Delivery & Marketplace contract 
Upon receiving physical instrument, calls a function to claim ownership of Horn NFT and release escrowed funds to seller
###### 5. Profit ;) 
