import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
import { nftaddress, nftmarketaddress } from '../config'
// import { hornmarketplaceaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
// import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'
// does escrow need import? probably not since it's never interacted with via frontend

export default function MintYourHornNFT () {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', make: '', model: '', style: '', serialNumber: '', description: ''})
    const router = useRouter()

    async function onChange(e) {
        const file = e.target.files[0]
        try {
          const added = await client.add(
              file,
              {
                  progress: (prog) => console.log('received:' + prog)
              }
          )
          const url = 'https://ipfs.infura.io/ipfs/' + added.path 
          setFileUrl(url)
        } catch (error) {
            console.log('File error', error)
        }
    }

    async function mintYourHornNFT() {
        const { make, model, style, serialNumber, description, price } = formInput
        if (!make || !model || !style || !serialNumber || !description || !price || !fileUrl) return // remove !price here and then add above line 43: try { if(!price) <'line 42+43'> mintbutdontlisthornNFT()
        const data = JSON.stringify({
            make, model, style, serialNumber, description, image: fileUrl
        })

        try { //change to if 
            const added = await client.add(data)
            const url = 'https://ipfs.infura.io/ipfs/' + added.path
            createHornNFT(url) // change name to mintandlistHorn, add make, model, style, serialNumber, price as parameters
        } catch (error) { // change to else and repeat lines above with new mintdontlistHorn function
            console.log('Error uploading file:', error)
        }
    }

    async function createHornNFT(url) { // change name to mintandlistHorn, calls mintthenlistnewhornnft() 
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(nftaddress, NFT.abi, signer) // hornmarketplaceaddress, hornmarketplace.abi
        let transaction = await contract.createToken(url) //mintthenlistnewhornnft() here, will need parameters for make, model, style, serialnumber, desiredprice, tokenuri (== url)
        // this calls the nft contracts createtoken
        let tx = await transaction.wait()

        // these three lines are just used to get the tokenId to pass into createMarketItem, dont think i need them
        let event = tx.events[0]
        let value = event.args[2] 
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        // these lines can be removed since i am working with only one contract, not two
        contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer) // hornmarketplaceaddress, hornmarketplace.abi
        let listingPrice = await contract.getListingPrice() // listingprice refers to the fee charged by the marketplace, delete this and line below
        listingPrice = listingPrice.toString()
        // this calls the market contract's createmarketitem
        transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
        await transaction.wait()
        

        // keep this line that pushes to home
        router.push('/')
    }

    /*
    async function mintDontListHorn(url) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      let contract = new ethers.Contract(hornmarketplaceaddress, HornMarketplace.abi, signer)
      let transaction = await contract.mintButDontListNewHornNFT(make, model, style, serialNumber, tokenUri)
      let tx = await transaction.wait()
    }
    */

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                  placeholder="Make/Manufacturer of Horn (ie Yamaha, Conn, Englebert Schmid)"
                  className="mt-8 border rounded p-4"
                  onChange={e => updateFormInput({ ...formInput, make: e.target.value })} 
                />
                
                <input
                  placeholder="Model of Horn (ie 667, 8D, Custom)"
                  className="mt-2 border rounded p-4"
                  onChange={e => updateFormInput({ ...formInput, model: e.target.value })}
                />
                <input
                  placeholder="Style of Horn (ie Geyer Double, Kruspe Double, Triple)"
                  className="mt-2 border rounded p-4"
                  onChange={e => updateFormInput({ ...formInput, style: e.target.value })}
                />
                <input
                  placeholder="Serial Number (ie 69420, 42069, 12345)"
                  className="mt-2 border rounded p-4"
                  onChange={e => updateFormInput({ ...formInput, serialNumber: e.target.value })}
                />
                <textarea
                  placeholder="Description (Please provide any other relevant information here)"
                  className="mt-2 border rounded p-4"
                  onChange={e => updateFormInput({ ...formInput, description: e.target.value })} 
                />
                <input 
                  placeholder="List Price in Eth"
                  className="mt-2 border rounded p-4"
                  onChange={e => updateFormInput({ ...formInput, price: e.target.value })} 
                />
                <input 
                  type="file"
                  name="Asset"
                  className="my-4"
                  onChange={onChange}
                />
                {
                    fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl} />
                    )
                }
                <button 
                  onClick={mintYourHornNFT}
                  className="font-bold mt-4 bg-green-500 text-white rounded p-4 shadow-lg"
                >
                    Mint Your Horn NFT
                </button>
            </div>
        </div>
    )
}
