/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'
import Head from 'next/head'
import { ethers, providers } from 'ethers'
import { useEffect, useState, useCallback, useReducer } from 'react'
import axios from 'axios'
import Web3Modal from 'web3Modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
import { ellipseAddress, getChainData } from '../config/chaindata'
import { oneneverseaddress } from '../config/contractContext'
import  ONENEVERSE from '../../../hardhat/artifacts/contracts/ONENEVERSE.sol/ONENEVERSE.json'

const INFURA_ID = process.env.INFURA_PID

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraID: INFURA_ID
    },
  },
  'custom-walletlink': {
    display: {
      logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
      name: 'Coinbase',
      description: 'Connect to Coinbase Wallet (not Coinbase App)',
    },
    options: {
      appName: 'ICH1BA', // Your app name
      networkUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
      chainId: 1,
    },
    package: WalletLink,
    connector: async (_: any, options: { appName: any; networkUrl: any; chainId: any }) => {
      const { appName, networkUrl, chainId } = options
      const walletLink = new WalletLink({
        appName,
      })
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
      await provider.enable()
      return provider
    },
  },
}

let web3Modal: Web3Modal
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true,
    providerOptions, // required
  })
}

type StateType = {
  provider?: any
  web3Provider?: any
  address?: string
  chainId?: number
}

type ActionType =
  | {
    type: 'SET_WEB3_PROVIDER'
    provider?: StateType['provider']
    web3Provider?: StateType['web3Provider']
    address?: StateType['address']
    chainId?: StateType['chainId']
  }
  | {
    type: 'SET_ADDRESS'
    address?: StateType['address']
  }
  | {
    type: 'SET_CHAIN_ID'
    chainId?: StateType['chainId']
  }
  | {
    type: 'RESET_WEB3_PROVIDER'
  }

const initialState: StateType = {
  provider: null,
  web3Provider: null,
  address: undefined,
  chainId: 1,
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      }
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.address,
      }
    case 'SET_CHAIN_ID':
      return {
        ...state,
        chainId: action.chainId,
      }
    case 'RESET_WEB3_PROVIDER':
      return initialState
    default:
      throw new Error()
  }
}

export const Home = (): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { provider, web3Provider, address, chainId } = state

  const connect = useCallback(async function () {
    // This is the initial `provider` that is returned when
    // using web3Modal to connect. Can be MetaMask or WalletConnect.
    const provider = await web3Modal.connect()
    console.log('provider is: ' + provider)
    // We plug the initial `provider` into ethers.js and get back
    // a Web3Provider. This will add on methods from ethers.js and
    // event listeners such as `.on()` will be different.
    const web3Provider = new providers.Web3Provider(provider)
    console.log('web3provider is: ' + web3Provider)
    const signer = web3Provider.getSigner()
    const address = await signer.getAddress()
    const network = await web3Provider.getNetwork()

    dispatch({
      type: 'SET_WEB3_PROVIDER',
      provider,
      web3Provider,
      address,
      chainId: network.chainId,
    })
  }, [])

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider()
      if (provider?.disconnect && typeof provider.disconnect === 'function') {
        await provider.disconnect()
      }
      dispatch({
        type: 'RESET_WEB3_PROVIDER',
      })
    },
    [provider]
  )

  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect()
    }
  }, [connect])

  // A `provider` should come with EIP-1193 events. We'll listen for those events
  // here so that when a user switches accounts or networks, we can update the
  // local React state with that new information.
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        // eslint-disable-next-line no-console
        console.log('accountsChanged', accounts)
        dispatch({
          type: 'SET_ADDRESS',
          address: accounts[0],
        })
      }

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId: string) => {
        window.location.reload()
      }

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log('disconnect', error)
        disconnect()
      }

      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)
      provider.on('disconnect', handleDisconnect)

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged)
          provider.removeListener('chainChanged', handleChainChanged)
          provider.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [provider, disconnect])

  const chainData = getChainData(chainId)
  const [onvs, setOnvs] = useState(Array())
  const [loadingState, setLoadingState] = useState('not-loaded')
  // useEffect(() => {
  //   loadONVs()
  // }, [])

  async function loadONVs() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const onvContract = new ethers.Contract(oneneverseaddress, ONENEVERSE.abi, provider)
    const data = await onvContract.retrieveUnsoldItems()
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
    console.log('items: ', items)
    setOnvs(items)
    setLoadingState('loaded')
  }

  async function buyONV(onv: { price: { toString: () => string }; tokenId: any }) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(oneneverseaddress, ONENEVERSE.abi, signer)
    const price = ethers.utils.parseUnits(onv.price.toString(), 'ether')
    const transaction = await contract.createONVSale(oneneverseaddress, onv.tokenId, {
      value: price
    })
    await transaction.wait()
    loadONVs()
  }

  if (loadingState === 'loaded' && !onvs.length) {
    return (
      <h1 className="px-20 py-10 text-3xl">No items in yet</h1>
    )
  }
  return (
    <><div className="container">
      <Head>
        <title>ONENEVERSE</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        {address && (
          <div className="grid">
            <div>
              <p className="mb-1">Network:</p>
              <p>{chainData?.name}</p>
            </div>
            <div>
              <p className="mb-1">Address:</p>
              <p>{ellipseAddress(address)}</p>
            </div>
          </div>
        )}
      </header>

      <main>
        <h1 className="title">Connect Web3 Wallet</h1>
        {web3Provider ? (
          <button className="button" type="button" onClick={disconnect}>
            Disconnect
          </button>
        ) : (
          <button className="button" type="button" onClick={connect}>
            Connect
          </button>
        )}
      </main>

      <style jsx>{`
        main {
          padding: 5rem 0;
          text-align: center;
        }
        p {
          margin-top: 0;
        }
        .container {
          padding: 2rem;
          margin: 0 auto;
          max-width: 1200px;
        }
        .grid {
          display: grid;
          grid-template-columns: auto auto;
          justify-content: space-between;
        }
        .button {
          padding: 1rem 1.5rem;
          background: ${web3Provider ? 'red' : 'green'};
          border: none;
          border-radius: 0.5rem;
          color: #fff;
          font-size: 1.2rem;
        }
        .mb-0 {
          margin-bottom: 0;
        }
        .mb-1 {
          margin-bottom: 0.25rem;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      <div className='flex justify-center'>
        <div className='px-4' style={{ maxWidth: '1600px' }}>
          <div className='grid grid-cols-1 sm:grid-cols2 lg:grid-cols-4 gap-4 pt-4'>
            {onvs.map((onv, i) => (
              <div key={i} className='border shadow rounded-xl overflow-hidden'>
                <img src={onv.image} alt="ovn image"/>
                <div className='p-4'>
                  <p style={{ height: '64px' }} className='text-2xl font-semibold'>{onv.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{onv.descriptioon}</p>
                  </div>
                </div>
                <div className='p-4 bg-black'>
                  <p className='text-2xl mb-4 font-bold text-white'>{onv.price} ETH</p>
                  <button className='w-full bg-fuchsia-500 text-white font-bold py-2 px-12 rounded'
                    onClick={() => buyONV(onv)}>Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
    </>
  )
}

export default Home