import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { hornmarketplaceaddress } from '../config'
import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

export default function TransactionsInProgress() { // check msg.sender balance for horns that are enum == 1 || 2 and return them under your sales, then check if msg.sender is in buyertohornarray mapping, if so return horns being purchased under your purchases
    const [needsShip, setNeedsShip] = useState([])
    const [shippingAddr, setShippingAddr] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    // const [purchases, setPurchases] = useState([]) // react relies on order of useState
    
    useEffect(() => {
        loadSellerNfts()
    }, [])

    async function loadSellerNfts() {
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
                price,
                tokenId: i.tokenId.toNumber(),
                owner: i.currentOwner,
                make: metadata.data.make,
                model: metadata.data.model,
                style: metadata.data.style,
                serialNumber: metadata.data.serialNumber,
                status: i.status,
                description: metadata.data.description,
                image: metadata.data.image,
            }
            return item
        }))

        const toBeShipped = items.filter(i => i.status == 1)
        const toAwaitDelivery = items.filter(i => i.state == 2)

        const shippingAddress = await marketContract.shippingAddresses(signer.getAddress())
        const addr = shippingAddress.split('^')

        setNeedsShip(toBeShipped)
        setShippingAddr(addr)
        setLoadingState('loaded')
    }

    async function markAsShipped(nft) {
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
      const shipTo = marketContract.getShippingAddress()
      marketContract.markHornShipped(nft.tokenId, shipTo)
    }

    // filter for purchased horns:
    // const purchasedItems = items.filter(i => i.status == 1 || 2)
    // setPurchases(purchasedItems)

    if (loadingState === 'loaded' && !needsShip.length /*&& !purchases.length */) return (
      <div>
        <h1 className="flex justify-center py-10 px-20 text-3xl">No Horns minted yet</h1>
        <p className="flex justify-center text 2-1 text-gray">Head to 'Marketplace Home' to get started with selling or purchasing a horn NFT</p>
      </div>
    )
    return (
      <div>
        <div className="p-9">
        <h2 className="font-bold text-2x1 py-2">Owned Horn NFTs</h2>
          {
            Boolean(needsShip.length) && (
              <div>
                <h2 className="text-2x1 py-2">Your Sales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {
                    needsShip.map((nft, i) => (
                      <div key={i} className="border shadow rounded-x1 overflow-hidden p-7">
                        <img src={nft.image} className="rounded" />
                        <div className="p-0">
                          <p style={{ height: '50px' }} className="flex justify-center text-3xl font-semibold p-4">{nft.make}</p>
                          <div style={{ height: "30px", overflow: 'hidden' }}>
                            <p className="flex justify-center text-gray-400 p-1">Model: {nft.model}</p>
                          </div>
                        </div>
                        <div className="p-1">
                          <p style={{ height: "0"}} className="flex justify-center text-2x1 mb-6 text-black">Listed Price: {nft.price} Eth</p>
                        </div>
                        <div className="p-3">
                          <h2 className="flex justify-center font-bold items-center px-25 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-500">Sold! Buyer sent payment to escrow</h2>
                          <p className="px-3 flex justify-center items-center py-1 text-gray-500 font-small">Click below to confirm address:</p>
                          <div className="p-2">
                            <div className="p-1 flex justify-center">
                              <p className="p-1 font-semibold font-medium flex justify-center">{ shippingAddr }</p>
                            </div>
                              <button className="flex justify-center items-center px-20 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600"
                                onClick={() => markAsShipped(nft)}>
                                Confirm Address and Mark as Shipped
                              </button>
                            
                          </div>
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
          {/*
            Boolean(purchases.length) && (
              <div>
                <h2 className="text-2x1 py-2">Your Horn NFTs Not Listed For Sale</h2>
                <div className="grid grid-cols-1 smg:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {
                    purchases.map((nft, i) => (
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
                          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px12 rounded-md"
                            onClick={() => listExisting(nft)}>List This Horn NFT</button>
                        </div>


                      </div>
                    ))
                  }
                </div>
              </div>
            )
          */}
        </div>
      </div>
    )
}
