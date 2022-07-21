import { ethers } from 'ethers'
import { useState } from 'react'
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { nftaddress, nftmarketaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import { useRouter } from 'next/router'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'

// in this component we set the ipfs up to host our nft data of
// file storage 

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function MintItem() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({
        title: '', RoomCode: '', pricePerDay: '', Location: '', Address: '', Direct: '', Floor: '', MaxRoom: '',
        Area: '', Toilet: '', People: '', Detail: '', Building: '',
    })
    const router = useRouter()


    // set up a function to fireoff when we update files in our form - we can add our 
    // NFT images - IPFS

    async function onChange(e) {
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file, {
                progress: (prog) => console.log(`received: ${prog}`)
            })
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log('Error uploading file:', error)
        }
    }

    async function createMarket() {
        const { title, RoomCode, pricePerDay, Location, Address, Direct, Floor, MaxRoom, Area, Toilet, People, Detail, Building, datesBooked } = formInput
        if (!title || !RoomCode || !pricePerDay || !Location || !Address || !Direct || !Floor || !MaxRoom || !Area || !Toilet || !People || !Detail || !Building || !fileUrl) return
        // upload to IPFS
        const data = JSON.stringify({
            title, RoomCode, pricePerDay, Location, Address, Direct, Floor, MaxRoom, Area, Toilet, People, Detail, Building, image: fileUrl
        })
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            // run a function that creates sale and passes in the url 
            createSale(url)
        } catch (error) {
            console.log('Error uploading file:', error)
        }
    }

    async function createSale(url) {
        // create the items and list them on the marketplace
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        // we want to create the token
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.mintToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        const pricePerDay = ethers.utils.parseUnits(formInput.pricePerDay, 'ether')

        // list the item for sale on the marketplace 
        contract = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.makeMarketItem(nftaddress, tokenId, pricePerDay, { value: listingPrice })
        await transaction.wait()
        router.push('./')
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input
                    placeholder='Asset Title'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, title: e.target.value })}
                />
                <input
                    placeholder='Asset Room Code'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, RoomCode: e.target.value })}
                />
                <input
                    placeholder='Asset Location'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, Location: e.target.value })}
                />
                <input
                    placeholder='Asset Address'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, Address: e.target.value })}
                />
                <input
                    placeholder='Asset Direct'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, Direct: e.target.value })}
                />
                <input
                    placeholder='Asset Floor'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, Floor: e.target.value })}
                />
                <input
                    placeholder='Asset Max Room'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, MaxRoom: e.target.value })}
                />
                <input
                    placeholder='Asset Area'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, Area: e.target.value })}
                />
                <input
                    placeholder='Asset Toilet'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, Toilet: e.target.value })}
                />
                <input
                    placeholder='Asset People'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, People: e.target.value })}
                />
                {/* <input
                placeholder='Asset Detail'
                className='mt-8 border rounded p-4'
                onChange={ e => updateFormInput({...formInput, Detail: e.target.value})} 
                /> */}
                <input
                    placeholder='Asset Building'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, Building: e.target.value })}
                />


                {/* <input type="date" name="date"
                placeholder='Asset Create At'
                className='mt-8 border rounded p-4'
                onChange={ e => updateFormInput({...formInput, CreateAt: e.target.value})} 
                /> */}
                <textarea
                    placeholder='Asset Detail'
                    className='mt-2 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, Detail: e.target.value })}
                />
                <input
                    placeholder='Asset Price Per Day in Eth'
                    className='mt-2 border rounded p-4'
                    onChange={e => updateFormInput({ ...formInput, pricePerDay: e.target.value })}
                />
                <input
                    type='file'
                    name='Asset'
                    className='mt-4'
                    onChange={onChange}
                /> {
                    fileUrl && (
                        <img className='rounded mt-4' width='350px' src={fileUrl} />
                    )}
                <button onClick={createMarket}
                    className='font-bold mt-4 bg-purple-500 text-white rounded p-4 shadow-lg'
                >
                    Mint NFT
                </button>
            </div>
        </div>
    )

}