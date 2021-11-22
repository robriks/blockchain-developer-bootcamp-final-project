NFT Marketplace & Escrow Contract for Classical Musicians
by robriks github.com/robriks/consensys-academy-final-project
hornosexual.eth (0x65b54A4646369D8ad83CB58A5a6b39F22fcd8cEe)
#######Front-end Address: github pages url here


# Project Description:
A full-stack dApp featuring a Horn Marketplace that allows classical musicians to mint their instruments as unique NFTs with verifiable, immutable ownership records and to upload an accompanying image to IPFS for easy, decentralized image storage. These NFTs can be bought and sold in a trustless peer-to-peer exchange via an escrow smart contract. The exchange process of purchasing, shipping, and transferring NFT ownership on delivery is secured by access control and does not rely on any intermediary or require any trust at any step, except for the off-chain shipping company used to deliver the physical instrument. Full write-up is at the bottom of this document.

# Setup instructions:
Clone the repo:
```git clone github.com/robriks/consensys-academy-final-project```

Navigate to root directory and install dependencies for the dApp  to function:
In the project's root directory, run 
```npm install```

How to run the project tests:
Important Note: Even though the main structure of the project is built using Hardhat, the tests are written in Solidity and must be tested using Truffle.  If you do not have Truffle installed globally, you may also need to navigate to the "truffle-test-inside-this-directory" folder and run 
```npm install``` 
there as well in order to install the testing dependencies in order to run the 
```truffle test```
command that will compile and run Solidity tests on a temporary test blockchain provided by Truffle behind the scenes at port 9545. If you prefer to test against a custom local blockchain, you may uncomment lines 44-50 in the "truffle-config.js" file within "truffle-test-inside-this-directory" and use the specified port 7545 (or change it to whatever port you like). For grading purposes, running ```truffle test``` inside "truffle-test-inside-this-directory" should suffice.  

IMPORTANT: This means ```$npx hardhat test``` will NOT compile or properly run the tests (there is not even the standard "test" directory).

Instead, navigate into the directory named: "truffle-test-inside-this-directory" and then run ```$truffle test``` to execute (and grade :) ) my 46 passing tests. This MUST be the command used to run the Solidity test files in the truffle-test-inside-this-directory folder, because they rely on Truffle and NOT Hardhat like the rest of the project. I understand this is a bit unusual and inconvenient but given the time constraints for the final project due date and the fact that I have thus shown competence in building a dapp using two frameworks, both Truffle and Hardhat, I hope this won't detract from my final grade and maybe even earn me some extra credit ;P .

Why use both Truffle and Hardhat?  Since there was more recent documentation available, I decided to use Hardhat to develop my front-end after originally having written my contracts and tests using Truffle. I originally chose to use Truffle to write Solidity tests because I wanted to really delve into Solidity as a language to become fluent in it as fast as possible. After having migrated to Hardhat, and halfway through working on my front-end, I belatedly realized that Hardhat does not support Solidity tests. Since Hardhat does not support tests written in Solidity, this project instead includes a nested truffle project to run the Solidity tests from.


#####In your README.md, be sure to have clear instructions on: 

####### edit when deployed to rinkeby
Start the front-end server to interface with the smart contracts:
In the root directory, ensure that configurations are properly set by populating the .secret file (which is protected by .gitignore) with the private key to your Rinkeby testnet account. ?????It is currently  to the standard Account#1 provided by Hardhat's development blockchain (which you started with ```npx hardhat node```).

Remember: DO NOT UPLOAD SENSITIVE INFORMATION TO GITHUB OR A PUBLIC SITE! Be sure to only add Infura account details, MetaMask mnemonics, any private keys, etc., to the .env and .secret files, which will be injected into the Horn Marketplace dApp through Infura/MetaMask privately and securely.  This file is protected by a .gitignore in the project locally so that your private keys are NEVER uploaded to the blockchain or to GitHub by git tracking.


-A screencast of you walking through your project, including submitting transactions and seeing the updated state. You can use a screenrecorder of your choosing or something like Loom, and you can share the link to the recording in your README.md

# NEEDSCREENCAST


# Full-length Writeup:

My inspiration:
As a hornist with the National Symphony Orchestra in Washington, DC, I have intimate familiarity with the inefficiencies of the global French Horn marketplace under legacy systems. (Note: these inefficiencies also permeate the classical music industry at large, however I have chosen to focus my efforts on the global horn market as this is my area of expertise. Future endeavors may expand this scope to other instrument markets.)

The problem:
These inefficiencies have grown to an unconscionable level, where rent-takers and middlemen abuse their positions in the market (by way of audience reach & trust) to extract large profit margins (10%-20%) from sellers and, by inflating prices across the market via commission, buyers as well. For example, the three largest French horn consignment sellers in the United States, PopeRepair, Houghton Horns, and Wichita Band all charge between 12-20% for people to sell their instruments through their consignment program. These margins on instruments that range from $3000 to $20000 place an oversize burden on sellers and artificially inflate prices in the used horn market, harming buyers.

The solution:
Blockchain smart contracts, specifically on Ethereum, are uniquely positioned to disintermediate these consignment intermediaries by automating instrument sales via escrow of Non-Fungible-Tokens that represent each instrument. Tokenized real-world assets can provide a transparent, immutable, and verifiable record of who owns an instrument and the time of purchase/transfer in order to alleviate an inefficient market currently rife with excessive consignment fees, scams, and financial fraud.

The process:
Sellers mint an NFT of the musical item they would like to sell, buyers deposit funds into the escrow smart contract, locking them until the seller has shipped the item to the buyer, who calls a one-way unlock function to release the funds from escrow to the seller, completing the sale.

Advantages:
-Horns' ownership history can easily be verified on the blockchain; this is important because some instruments were owned and played by historically significant musicians (think classical music celebrities) and their value may be appraised accordingly
-Prevent instrument scams (via automated escrow) which are prevalent on such platforms as Ebay, Etsy, Alibaba, and the like through check bounces or other financial fraud schemes.

Disadvantages:
-Since the instruments are not digital assets, much of the process must be carried out off-chain. 
-The usual pseudonymity of the crypto economy is relinquished, seeing as musicians generally don't want to operate in a trustless environment by selling to an internet stranger and would much rather openly communicate/negotiate with buyers. Luckily web3 features transparency and makes this easy.

TL;DR:

1. Seller -> smart contract                 # mints/lists NFT representing physical instrument, using website frontend to communicate horn model/serialNum/other data to the blockchain
2. Buyer -> escrow smart contract           # deposits & locks funds in escrow to buy instrument and provide proof of payment
3. Front-end listening for buyer 'purchase' # offchain*
4. Seller ships instrument to seller        # offchain* 
5. Trial period?                            # Smart contract releases escrow funds 7 days after received? buyer calls function?
6. Contract releases funds to seller        # Sale completed
7. Profit ;) 
