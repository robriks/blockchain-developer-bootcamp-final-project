import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import { hornmarketplaceaddress } from '../config'
import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

export default function YourActivePurchases() {
    const [purchases, setPurchases] = useState([])
    const [shipped, setShipped] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    const router = useRouter()
    
    useEffect(() => {
        loadBuyerNfts()
    }, [])

    async function loadBuyerNfts() {
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
        const data = await marketContract.getPurchasedHorns()

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
                //shipTo: shippingAddress.split('^'),
            }
            return item
        }))

        const purchasedHorns = items.filter(i => i.status == 1)
        const shippedHorns = items.filter(i => i.status == 2)

        setPurchases(purchasedHorns)
        setShipped(shippedHorns)
        setLoadingState('loaded')
    }

    async function claimOwnership(nft) {
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
        let transaction = await marketContract.markHornDeliveredAndOwnershipTransferred(nft.tokenId)
        let tx = transaction.wait()
    
        router.push('/my-horns')
      }


    if (loadingState === 'loaded' && !purchases.length && !shipped.length) return (
    <div>
        <h1 className="flex justify-center py-10 px-20 text-3xl">You haven't purchased a Horn NFT yet</h1>
        <p className="flex justify-center text 2-1 text-gray">Head to 'Marketplace Home' to get started with selling or purchasing a horn NFT</p>
    </div>
    )
    return (
      <div>
        <div className="p-9">
        <h2 className="font-bold text-2x1 py-2">Your Active Purchases</h2>
        {
          Boolean(purchases.length) && (
            <div>
              <h2 className="text-2x1 py-2">Purchased Horns</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {
                  purchases.map((nft, i) => (
                    <div key={i} className="border shadow rounded-x1 overflow-hidden p-7">
                      <div className="p-0">
                        <p style={{ height: '50px' }} className="flex justify-center text-3xl font-semibold p-4">{nft.make}</p>
                        <div style={{ height: "30px", overflow: 'hidden' }}>
                          <p className="flex justify-center text-gray-400 p-1">Model: {nft.model}</p>
                        </div>
                      </div>
                      <img src={nft.image} className="rounded" />
                      <div className="p-1">
                        <p style={{ height: "0"}} className="flex justify-center text-2x1 mb-6 text-black">Price Paid: {nft.price} Eth</p>
                      </div>
                      <div className="p-2">
                        <h2 className="flex justify-center font-bold items-center px-25 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-500">
                          Paid! Your payment was sent to escrow
                        </h2>
                        <div className="p-0">
                          <div className="p-0 flex justify-center">
                            <p className="p-2 font-semibold font-medium flex justify-center">
                            </p>
                          </div>
                            <div className="flex justify-center items-center px-20 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500">
                               Waiting for seller to ship this horn to your given address
                            </div>
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
        <div className="p-9">
        {
          Boolean(shipped.length) && (
            <div>
              <h2 className="text-2x1 py-2">Shipped Horns</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {
                  shipped.map((nft, i) => (
                    <div key={i} className="border shadow rounded-x1 overflow-hidden p-7">
                      <div className="p-1">
                        <p style={{ height: '50px' }} className="flex justify-center text-3xl font-semibold p-4">{nft.make}</p>
                        <div style={{ height: "30px", overflow: 'hidden' }}>
                          <p className="flex justify-center text-gray-400 p-1">Model: {nft.model}</p>
                        </div>
                      </div>
                      <img src={nft.image} className="rounded" />
                      <div className="p-1">
                        <p style={{ height: "0"}} className="flex justify-center text-2x1 mb-6 text-black">Price Paid: {nft.price} Eth</p>
                      </div>
                      <div className="p-2">
                        <h2 className="flex justify-center font-bold items-center px-25 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-500">
                          On its way! Shipped by seller
                        </h2>
                        <div className="p-0">
                          <div className="p-0 flex justify-center">
                            <p className="p-2 font-semibold font-medium flex justify-center">
                            </p>
                          </div>
                            <button className="flex justify-center items-center px-20 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600"
                              onClick={() => claimOwnership(nft)}>
                               Upon delivery, click here to claim ownership of the horn and its NFT
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
