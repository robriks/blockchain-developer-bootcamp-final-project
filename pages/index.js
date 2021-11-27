import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { hornmarketplaceaddress } from '../config'
import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [formInput, updateFormInput] = useState({ street: '', city: '', state: '', zip: '' })

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/e365267f08f0496abe0b04e071a4bc1f')
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

    // shippingAddress is created by combining the inputs in text fields above the buy button
    // this address must be EXACTLY matched by the seller later when calling the ship function
    const { street, city, state, zip } = formInput
    const shippingAddress = street + '^' + city + '^' + state + '^' + zip
    const contract = new ethers.Contract(hornmarketplaceaddress, HornMarketplace.abi, signer)
    // selected nft is passed into this function scope from button onClick handler
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
            {
              nfts.map((nft, i) => (
                <div key={i} className="shadow rounded-x1 overflow-hidden">
                  <div className="p-3">
                    <p style={{ height: '50px' }} className="flex justify-center text-3xl font-semibold p-4">{nft.make}</p>
                    <div style={{ height: "30px", overflow: 'hidden' }}>
                      <p className="flex justify-center text-gray-400 p-1">Model: {nft.model}</p>
                  </div>
                  </div>
                  <img src={nft.image} />
                  <div className="p-2">
                    <p style={{ height: "0"}} className="flex justify-center text-2x1 mb-6 text-black">Listed Price: {nft.price} Eth</p>
                    <p className="text-1x1 text-gray-400">Please enter your shipping address to purchase:</p>
                  </div>
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Street address</label>
                    <input type="text" name="street-address" id="street-address" 
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                      onChange={e => updateFormInput({...formInput, street: e.target.value })}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" id="city" 
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      onChange={e => updateFormInput({...formInput, city: e.target.value })} 
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">State / Province</label>
                    <input type="text" name="region" id="region"  
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                      onChange={e => updateFormInput({...formInput, state: e.target.value })}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">ZIP / Postal code</label>
                    <input type="text" name="postal-code" id="postal-code" 
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                      onChange={e => updateFormInput({...formInput, zip: e.target.value })}
                    />
                  </div>
                  <div className="p-1">
                    <button style={{height: '50px'}} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-12 rounded-md" 
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
