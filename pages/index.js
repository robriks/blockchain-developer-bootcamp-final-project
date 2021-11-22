import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import { hornmarketplaceaddress } from '../config'
import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [formInput, updateFormInput] = useState({ shippingAddress: '' })

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider()
    const marketContract = new ethers.Contract(hornmarketplaceaddress, HornMarketplace.abi, provider)
    const data = await marketContract.getCurrentlyListedHorns()
    let nonZeroData = data.filter(horn => horn.tokenId != 0)

    const items = await Promise.all(nonZeroData.map(async i => {
      const tokenUri = await marketContract.tokenURI(i.tokenId)
      const metadata = await axios.get(tokenUri)
      const price = ethers.utils.formatUnits(i.listPrice.toString(), "ether")
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        owner: i.currentOwner,
        make: metadata.data.make,
        model: metadata.data.model,
        style: metadata.data.style,
        serialNumber: metadata.data.serialNumber,
        description: metadata.data.description,
        image: metadata.data.image,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }

  async function purchaseHorn(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(hornmarketplaceaddress, HornMarketplace.abi, signer)
    const shippingAddress = formInput.shippingAddress
    // selected nft is passed into this function scope from button onClick handler
    // shippingAddress is entered in a text field above the buy button, this address must be EXACTLY matched by the seller later when calling the ship function
    const paymentAmount = ethers.utils.parseUnits(nft.price, "ether")
    const transaction = await contract.purchaseHornByHornId(nft.tokenId, shippingAddress, { value: paymentAmount })

    await transaction.wait()
    loadNFTs()
  }

  if (loadingState === 'loaded' && !nfts.length) return (
    <div>
      <h1 className="flex justify-center py-10 px-20 text-3x1">No horns listed for sale in marketplace</h1>
    </div>
  )

  return (
    <div className="flex justify-center">
      <div className="p-4">
      <h2 className="font-bold text-2x1 py-2">Horns For Sale</h2>
        <div className="px-r" style={{ maxWidth: '1600px'}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-x1 overflow-hidden">
                  <img src={nft.image} />
                  <div className="p-4">
                    <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.make}</p>
                    <div style={{ height: "70px", overflow: 'hidden' }}>
                      <p className="text-gray-400">Model: {nft.model}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2x1 mb-4 font-bold text-white">Listed Price: {nft.price} Eth</p>
                    <input 
                      placeholder="Enter your shipping address in order to purchase"
                      className="mt-2 border rounded p-2"
                      onChange={e => updateFormInput({ formInput, shippingAddress: e.target.value })}
                    />
                    <button className="w-full bg-green-500 text-white font-bold py-2 px-12 rounded" 
                      onClick={() => purchaseHorn(nft)}>Purchase Horn</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
