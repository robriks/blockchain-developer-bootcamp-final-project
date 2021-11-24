import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import { hornmarketplaceaddress } from '../config'
import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

export default function MyHorns() {
    const [nfts, setNfts] = useState([])
    const [listed, setListedNfts] = useState([])
    const [unlisted, setUnlistedNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [formInput, updateFormInput] = useState({ price: '' })
    
    const router = useRouter()
    
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

        setListedNfts(listedNfts)
        setUnlistedNfts(unlistedNfts)
        setNfts(items)
        setLoadingState('loaded')
    }

    function isSoldOrShippedOrDelivered(nft) {
      if (nft.status == 1) { // Horn NFT shown as Sold by reading enum HornStatus from Marketplace contract
        return (
          <div className="p-3">
            <h2 className="flex justify-center font-bold items-center px-25 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-500">Sold! Buyer sent payment to escrow</h2>
            <p className="flex justify-center items-center py-1 text-gray-500 font-small">Click below to view shipping address:</p>
            <div className="p-2 flex justify-center">
              <button className="flex justify-center items-center px-20 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600"
                onClick={(e) => {
                  router.push('/your-active-sales')
                }}>
                Click to Ship
              </button>
            </div>
          </div>
        )
      } 
      if (nft.status == 2) { // Horn NFT shown as Shipped by reading enum HornStatus from Marketplace contract
        return (
          <div className="p-3">
            <h2 className="flex justify-center font-bold items-center px-25 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-500">
              Shipped to buyer! Awaiting delivery
            </h2>
          </div>
        )
      }
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {
                    listed.map((nft, i) => (
                      <div key={i} className="border shadow rounded-x1 overflow-hidden p-7">
                      <div className="p-3">
                          <p style={{ height: '50px' }} className="flex justify-center text-3xl font-semibold p-4">{nft.make}</p>
                          <div style={{ height: "30px", overflow: 'hidden' }}>
                            <p className="flex justify-center text-gray-400 p-1">Model: {nft.model}</p>
                          </div>
                        </div>
                        <img src={nft.image} className="rounded" />
                        <div className="p-1">
                          <p style={{ height: "0"}} className="flex justify-center text-2x1 mb-6 text-gray-400">Listed Price: {nft.price} Eth</p>
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
                      <div className="p-3">
                          <p style={{ height: '64px' }} className="flex justify-center text-3xl font-semibold p-4">{nft.make}</p>
                          <div style={{ height: "70px", overflow: 'hidden' }}>
                            <p className="flex justify-center text-gray-400 p-1">Model: {nft.model}</p>
                          </div>
                        </div>
                        <img src={nft.image} className="rounded" />
                        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                    <input placeholder="Desired Price in Eth" type="text" name="postal-code" id="postal-code" 
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                      onChange={e => updateFormInput({...formInput, price: e.target.value })}
                    />
                  </div><div>
                          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px12 rounded-md"
                            onClick={() => listExisting(nft)}>
                            List This Horn
                          </button>
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
