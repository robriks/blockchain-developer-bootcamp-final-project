import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {nftaddress, nftmarketaddress} from '../config'
// import { hornmarketplaceaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
// import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider) // delete
    const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider) // hornmarketplaceaddress, HornMarketplace.abi
    const data = await marketContract.fetchMarketItems() // change to .getCurrentHornsForSale()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId) // change to marketContract.tokenURI(i.tokenId) // ADD tokenId ATTRIBUTE TO HORN STRUCT
      const metadata = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), "ether")
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
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

  async function buyNft(nft) {
    // const shippingAddress = formInput
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer) // hornmarketplaceaddress, HornMarketplace.abi

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

    // selected nft is passed into this function scope from button onClick handler
    // shippingAddress is entered in a text field below the buy button, structured in the html/jsx below
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, { // change to .purchaseHornByHornId(nft.tokenId, shippingAddress, {value: price})
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }

  if (loadingState === 'loaded' && !nfts.length) return (
    <h1 className="px-20 py-10 text-3x1">No horns listed for sale in marketplace </h1>
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
                      <p className="text-gray-400">{nft.model}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2x1 mb-4 font-bold text-white">Listed Price: {nft.price} ETH</p>
                    {/*<input 
                      placeholder="Please enter shipping address in order to purchase"
                      className="mt-2 border rounded p-4"
                      onChange={e => updateFormInput({ ...formInput, shippingAddress: e.target.value })} // maybe dont need to ...separate since only 1 input
                    /> make sure this properly passes the shippingAddress input into the buyNft function above*/}
                    <button className="w-full bg-green-500 text-white font-bold py-2 px-12
                    rounded" onClick={() => buyNft(nft)}>Buy</button>
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
