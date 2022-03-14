/* eslint-disable @next/next/no-img-element */
import ONENEVERSE from '../../../hardhat/artifacts/contracts/ONENEVERSE.sol/ONENEVERSE.json'
import { oneneverseaddress } from '../config/contractContext'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { create } from 'ipfs-http-client'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
//import { create as ipfsHttpClient } from 'ipfs-http-client';

const client = create(({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }))
// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export function CreateOnv(): JSX.Element {
  const [fileUrl, setFileUrl] = useState("")
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e: any) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl)
      return
    // Upload to IPFS 
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      // Return url for use in tx
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function listONVSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(oneneverseaddress, ONENEVERSE.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let tx = await contract.createToken(url, price, { value: listingPrice })
    await tx.wait()
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="ONV Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })} />
        <input
          placeholder="ONV Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })} />
        <input
          placeholder="ONV Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })} />
        <input
          type="file"
          name="ONV"
          className="my-4"
          onChange={onChange} />
        {fileUrl && (
          <img className="rounded mt-4" width="350" src={fileUrl} alt="ile url" />
        )}
        <button onClick={listONVSale} className="mt-4 bg-blue-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>
    </div>
  )
}
export default CreateOnv













