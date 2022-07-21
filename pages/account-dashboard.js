
// we want to load the users nfts and display

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { nftaddress, nftmarketaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'

export default function AccountDashBoard() {
  // array of nfts
  const [nfts, setNFts] = useState([])
  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    // what we want to load:
    // we want to get the msg.sender hook up to the signer to display the owner nfts

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer)
    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      // we want get the token metadata - json 
      const meta = await axios.get(tokenUri)
      let pricePerDay = ethers.utils.formatUnits(i.pricePerDay.toString(), 'ether')
      let item = {
        pricePerDay,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        title: meta.data.title,
        RoomCode: meta.data.RoomCode,
        Location: meta.data.Location,
        Address: meta.data.Address,
        Direct: meta.data.Direct,
        Floor: meta.data.Floor,
        MaxRoom: meta.data.MaxRoom,
        Area: meta.data.Area,
        Toilet: meta.data.Toilet,
        People: meta.data.People,
        Detail: meta.data.Detail,
        Building: meta.data.Building,
        CreateAt: meta.data.CreateAt,
        datesBooked: meta.data.datesBooked,
      }
      return item
    }))

    // create a filtered aray of items that have been sold
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNFts(items)
    setLoadingState('loaded')
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1
    className='px-20 py-7 text-4x1'>You have not minted any NFTs!</h1>)

  return (
    <div className='p-4'>
      <h1 style={{ fontSize: '20px', color: 'purple' }}>Tokens Minted</h1>
      <div className='px-4' style={{ maxWidth: '1600px' }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {
            nfts.map((nft, i) => (
              <div key={i} className='border shadow rounded-x1 overflow-hidden'>
                <img className='w-full h-64' src={nft.image} />
                <div className='p-4'>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>{
                    nft.title}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Room Code: {
                    nft.RoomCode}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Location: {
                    nft.Location}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Address: {
                    nft.Address}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Direct: {
                    nft.Direct}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Floor: {
                    nft.Floor}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Max Room: {
                    nft.MaxRoom}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Area: {
                    nft.Area} m^2</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Toilet {
                    nft.Toilet}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>People: {
                    nft.People}</p>
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Building: {
                    nft.Building}</p>
                  {/* <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Create At: {
                    nft.CreateAt}</p> */}
                  <p style={{ height: '64px' }} className='text-3x1 font-semibold'>Date Booked: {
                    nft.datesBooked}</p>
                  {/* <p style={{ height: '64px' }} className='text-3x1 font-semibold'>ethAddress: {
                    address}</p> */}
                  <div style={{ height: '72px', overflow: 'hidden' }}>
                    <p className='text-gray-400'>{nft.Detail}</p>
                  </div>
                </div>
                <div className='p-4 bg-black'>
                  <p className='text-3x-1 mb-4 font-bold text-white'>{nft.pricePerDay} ETH</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
