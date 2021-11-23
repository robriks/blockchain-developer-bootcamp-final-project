import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
import { hornmarketplaceaddress } from '../config'

import HornMarketplace from '../artifacts/contracts/HornMarketplace.sol/HornMarketplace.json'

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
        if (!make || !model || !style || !serialNumber || !description || !fileUrl) return 
        const data = JSON.stringify({
            make, model, style, serialNumber, description, image: fileUrl
        })

        if (!price) {
          const added = await client.add(data)
          const url = 'https://ipfs.infura.io/ipfs/' + added.path
          mintDontListHorn(url)
        } else {
          const added = await client.add(data)
          const url = 'https://ipfs.infura.io/ipfs/' + added.path
          mintAndListHorn(url)
        }
    }

    async function mintAndListHorn(url) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const { make, model, style, serialNumber, price } = formInput
        const priceInEth = ethers.utils.parseUnits(formInput.price, 'ether')
        let contract = new ethers.Contract(hornmarketplaceaddress, HornMarketplace.abi, signer)
        let transaction = await contract.mintThenListNewHornNFT(url, make, model, style, serialNumber, priceInEth)
        // Submit the transaction
        let tx = await transaction.wait()
        
        router.push('/')
    }

    async function mintDontListHorn(url) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      
      const { make, model, style, serialNumber } = formInput
      let contract = new ethers.Contract(hornmarketplaceaddress, HornMarketplace.abi, signer)
      let transaction = await contract.mintButDontListNewHornNFT(url, make, model, style, serialNumber)
      let tx = await transaction.wait()

      // Push redirects user to currently owned horns instead of marketplace since it wasn't listed for sale
      router.push('/my-horns')
    }

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
                <p className="text-black-100">Note: Leave the price field below blank if you wish to mint your horn as an NFT without listing it for sale</p>
                <input 
                  placeholder="List Price in Eth (Leave blank if you wish to mint without listing for sale)"
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
                  className="font-bold mt-4 bg-green-500 hover:bg-green-600 text-white rounded-md p-4 shadow-lg"
                >
                    Mint Your Horn NFT
                </button>
            </div>
        </div>
    )
}
