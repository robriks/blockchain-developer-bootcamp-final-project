import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { nftmarketaddress, nftaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function MyHorns() { //MyHornNFTs
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
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

        const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchMyNFTs()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const metadata = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
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
    if (loadingState === 'loaded' && !nfts.length) return (
        <div>
          <h1 className="flex justify-center py-10 px-20 text-3xl">No Horns here!</h1>
          <p className="flex justify-center text 2-1 text-gray">Head to the 'Mint Your Horn NFT' section to get started with minting your horn as an NFT</p>
        </div>
    )
    return (
      <div>
        <div className="p-4">
        <h2 className="font-bold text-2x1 py-2">Owned Horn NFTs</h2>
          <div className="flex justify-center">
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {
                nfts.map((nft, i) => (
                  <div key={i} className="border shadow rounded-x1 overflow-hidden">
                    <img src={nft.image} className="rounded" />
                    <div className="p-4">
                      <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.make}</p>
                      <div style={{ height: "70px", overflow: 'hidden' }}>
                        <p className="text-gray-400">{nft.model}</p>
                      </div>
                    </div>
                    <div className="p-2 bg-black">
                      <p className="text 2-1 font-bold text-white">Last Price: {nft.price} Eth</p>"
                    </div>
                  </div>
                ))
              }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}
