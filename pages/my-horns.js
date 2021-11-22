import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { nftmarketaddress, nftaddress, hornmarketplaceaddress } from '../config'
//import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
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
        const web3Modal = new Web3Modal( //what does this actually do?
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

        const listedNfts = items.filter(i => i.status == 0)
        const unlistedNfts = items.filter(i => i.status == 3)
        setListedNfts(listedNfts)
        setUnlistedNfts(unlistedNfts)
        setNfts(items)
        setLoadingState('loaded')
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
        <div className="p-5">
        <h2 className="font-bold text-2x1 py-2">Owned Horn NFTs</h2>
          {
            Boolean(listed.length) && (
              <div>
                <h2 className="text-2x1 py-2">Your Horn NFTs Listed For Sale</h2>
                <div className="grid grid-cols-1 smg:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {
                    listed.map((nft, i) => (
                      <div key={i} className="border shadow rounded-x1 overflow-hidden">
                        <img src={nft.image} className="rounded" />
                        <div className="p-4">
                          <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.make}</p>
                          <div style={{ height: "70px", overflow: 'hidden' }}>
                            <p className="text-gray-400">Model: {nft.model}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-black">
                          <p className="text 2xl font-bold text-white">Listed Price: {nft.price} Eth</p>"
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
