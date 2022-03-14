/* eslint-disable @next/next/no-img-element */
import { oneneverseaddress } from '../config/contractContext'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'
import ONENEVERSE from '../../../hardhat/artifacts/contracts/ONENEVERSE.sol/ONENEVERSE.json'

export function OwnONV() {
  const [onvs, setONVs] = useState(new Array())
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
  useEffect(() => {
    loadONVs()
  }, [])
  async function loadONVs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const onvContract = new ethers.Contract(oneneverseaddress, ONENEVERSE.abi, signer)
    const data = await onvContract.retrievePurchasedItems()
    const items = await Promise.all(data.map(async (i: {
      tokenId: { toNumber: () => any }
      price: { toString: () => ethers.BigNumberish }; seller: any; owner: any
    }): Promise<{
      price: string; tokenId: any; seller: any; owner: any
      image: any; name: any; description: any
    }> => {
      const tokenUri = await onvContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setONVs(items)
    setLoadingState('loaded')
  }
  function listONV({ onv }: { onv: any }): void {
    console.log('onv:', onv)
    router.push(`/resell-nft?id=${onv.tokenId}&tokenURI=${onv.tokenURI}`)
  }
  if (loadingState === 'loaded' && !onvs.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            onvs.map((onv, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={onv.image} className="rounded" alt="onv image" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {onv.price} Eth</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listONV(onv)}>List</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
export default OwnONV