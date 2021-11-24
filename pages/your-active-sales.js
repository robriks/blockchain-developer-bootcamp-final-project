import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import { hornmarketplaceaddress } from '../config'
import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

export default function YourCurrentSales() {
    const [needsShip, setNeedsShip] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    const router = useRouter()
    
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

            const shippingAddress = await marketContract.getShippingAddress(i.tokenId.toNumber())
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
                shipTo: shippingAddress.split('^'),
            }
            return item
        }))

        const toBeShipped = items.filter(i => i.status == 1)

        setNeedsShip(toBeShipped)
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
      const shipTo = marketContract.getShippingAddress(nft.tokenId)
      let transaction = await marketContract.markHornShipped(nft.tokenId, shipTo)
      let tx = transaction.wait()

      router.push('/my-horns')
    }

    if (loadingState === 'loaded' && !needsShip.length) return (
      <div>
        <h1 className="flex justify-center py-10 px-20 text-3xl">No Horn NFT sales yet</h1>
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
                      <div className="p-0">
                          <p style={{ height: '50px' }} className="flex justify-center text-3xl font-semibold p-4">{nft.make}</p>
                          <div style={{ height: "30px", overflow: 'hidden' }}>
                            <p className="flex justify-center text-gray-400 p-1">Model: {nft.model}</p>
                          </div>
                        </div>
                        <img src={nft.image} className="rounded" />
                        <div className="p-1">
                          <p style={{ height: "0"}} className="flex justify-center text-2x1 mb-6 text-black">Listed Price: {nft.price} Eth</p>
                        </div>
                        <div className="p-2">
                          <h2 className="flex justify-center font-bold items-center px-25 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-500">Sold! Buyer sent payment to escrow</h2>
                          <p className="px-3 flex justify-center items-center py-1 text-gray-500 font-small">Click below to confirm address:</p>
                          <div className="p-0">
                            <div className="p-0 flex justify-center">
                              <p className="p-2 font-semibold font-medium flex justify-center">
                              {nft.shipTo[0]}<br></br>
                              {nft.shipTo[1]}, &nbsp;
                              {nft.shipTo[2]}<br></br>
                              {nft.shipTo[3]}<br></br>
                              </p>
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
        </div>
      )
}
