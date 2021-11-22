import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { nftmarketaddress, nftaddress, hornmarketplaceaddress } from '../config'
import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

export default function MyHorns() {
    const [nfts, setNfts] = useState([])
    const [listed, setListedNfts] = useState([])
    const [unlisted, setUnlistedNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [formInput, updateFormInput] = useState({ price: '' })

    
    useEffect(() => {
        loadNfts()
    }, [])

    async function loadNfts() {
        const web3Modal = new Web3Modal(
            /*{
                network: "mainnet",
                cacheProvider: true,
            }*/
        )
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(hornmarketplaceaddress, HornMarketplace.abi, signer)
        const data = await marketContract.getCurrentlyOwnedHorns()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await marketContract.tokenURI(i.tokenId)
            const metadata = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.listPrice.toString(), 'ether')
            let item = {
                make: metadata.data.make,
                model: metadata.data.model,
                style: metadata.data.style,
                serialNumber: metadata.data.serialNumber,
                price,
                tokenId: i.tokenId.toNumber(),
                status: i.status, // Enum returned by contract is read as uint by ethers
                owner: i.currentOwner,
                image: metadata.data.image,
                description: metadata.data.description,
            }
            return item
        }))

        const listedNfts = items.filter(i => i.status < 3)
        const unlistedNfts = items.filter(i => i.status == 3)
        // const in
        setListedNfts(listedNfts)
        setUnlistedNfts(unlistedNfts)
        setNfts(items)
        setLoadingState('loaded')
    }

    function isSoldOrShippedOrDelivered(nft) {
      if (nft.status == 1) { // Horn NFT shown as Sold by reading enum HornStatus from Marketplace contract
        return (
          <div className="statusLabel">
            <h2 className="flex justify-center font-bold">Sold! Buyer sent payment to escrow</h2>
            <div className="center">
            <button className="flex font-bold">Go to Purchases and Sales to ship</button>
            </div>
            <style jsx>{`
              .statusLabel {
                margin: 20px;
                height: 50px;
                width: 350px;
                position: relative;
                background: green;
              }
              h2 {
                color: white;
                line-height: 3;
              }
              button {
                color: pink;
                margin: 5px;
                position: relative;
                background: purple;
                height: 40px;
                line-height: 2.4;
              }
            `}</style>
          </div>
        )
      } 
      if (nft.status == 2) { // Horn NFT shown as Shipped by reading enum HornStatus from Marketplace contract
        return (
          <div className="statusLabel">
            <h2 className="flex justify-center font-bold">Shipped to buyer!</h2>
          </div> // may need <style jsx>{``} here for label to have styling
        )
      }
      // if (nft.status == 3) {return()} // Horn NFT shown as Delivered by reading enum HornStatus from Marketplace contract
    }

    function showListPrice(nft) {
      return (
      <div className="p-1" style={{ margin: '1px', height: '20px' }}>
        <h2 className="flex justify-center text 2xl font-bold text-black">Listed Price: {nft.price} Eth</h2>
      </div>
      )
    }

    async function listExisting(nft) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      const contract = new ethers.Contract(hornmarketplaceaddress, HornMarketplace.abi, signer)
      const price = formInput.price
      const priceInEth = ethers.utils.parseUnits(price, 'ether')

      const transaction = await contract.listExistingHornNFT(nft.tokenId, priceInEth)
      await transaction.wait()
      loadNfts()
    }

    if (loadingState === 'loaded' && !nfts.length) return (
        <div>
          <h1 className="flex justify-center py-10 px-20 text-3xl">No Horns here!</h1>
          <p className="flex justify-center text 2-1 text-gray">Head to the 'Mint Your Horn NFT' section to get started with minting your horn as an NFT</p>
        </div>
    )
    return (
      <div>
        <div className="p-9">
        <h2 className="font-bold text-2x1 py-2">Owned Horn NFTs</h2>
          {
            Boolean(listed.length) && (
              <div>
                <h2 className="text-2x1 py-2">Your Horn NFTs Listed For Sale</h2>
                <div className="grid grid-cols-1 smg:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {
                    listed.map((nft, i) => (
                      <div key={i} className="border shadow rounded-x1 overflow-hidden p-7">
                        <img src={nft.image} className="rounded" />
                        <div className="p-0">
                          <p style={{ height: '50px' }} className="flex justify-center text-3xl font-semibold p-4">{nft.make}</p>
                          <div style={{ height: "30px", overflow: 'hidden' }}>
                            <p className="flex justify-center text-gray-400 p-1">Model: {nft.model}</p>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          { showListPrice(nft) }
                        </div>
                        <div>
                          { isSoldOrShippedOrDelivered(nft) }
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )
          }
        </div>
        <div className="p-5">
          {
            Boolean(unlisted.length) && (
              <div>
                <h2 className="text-2x1 py-2">Your Horn NFTs Not Listed For Sale</h2>
                <div className="grid grid-cols-1 smg:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {
                    unlisted.map((nft, i) => (
                      <div key={i} className="border shadow rounded-x1 overflow-hidden">
                        <img src={nft.image} className="rounded" />
                        <div className="p-4">
                          <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.make}</p>
                          <div style={{ height: "70px", overflow: 'hidden' }}>
                            <p className="text-gray-400">Model: {nft.model}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-black">
                          <input 
                            placeholder="List Price in Eth"
                            className="mt-2 border rounded p-4"
                            onChange={ e => updateFormInput({ formInput, price: e.target.value })}
                          />
                          <button className="w-full bg-green-500 text-white font-bold py-2 px12 rounded"
                            onClick={() => listExisting(nft)}>List This Horn NFT</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )
          }
        </div>
      </div>
    )
}
