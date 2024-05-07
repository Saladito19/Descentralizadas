//require('dotenv').config()
require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers, Contract} = require('ethers')
const contract = require('../artifacts/contracts/Sales.sol/Sales.json')
const { format } = require('path')
const user = require('./user')
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    SALES_CONTRACT
} = process.env

async function createTransaction(provider,method,params) {
    const etherInterface = new ethers.utils.Interface(contract.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY,'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from : PUBLIC_KEY,
        to : SALES_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method,params)
    }
    return transaction
}

async function createSale(userId, items, prices) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    const transaction = await createTransaction(provider,"insertSale",[userId,items,prices]);
    const estimateGas = await provider.estimateGas(transaction);
    transaction["gasLimit"] = estimateGas;
    const singedTx = await wallet.signTransaction(transaction);
    const transactionRecepit = await provider.sendTransaction(singedTx);
    await transactionRecepit.wait();
    const hash = transactionRecepit.hash;
    console.log("Transaction Hash",hash)
    const receipt = await provider.getTransactionReceipt(hash)
    return receipt
}

async function getSales() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const salesContract = new ethers.Contract(SALES_CONTRACT, Contract.abi,provider);
    const result = await salesContract.getSales()
    var sales = []
    result.forEach((element)=>{
        sales.push(formatSale(element))
    })
}
async function getSale(saleId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const salesContract = new ethers.Contract(SALES_CONTRACT, Contract.abi,provider);
    const result = await salesContract.getSaleById(saleId)
    return formatSale(result)
}

async function getSalesByUserId(userId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const salesContract = new ethers.Contract(SALES_CONTRACT, Contract.abi,provider);
    const result =  await salesContract.getSalesByUserId(userId)
    var sales = []
    result.forEach((element)=> {
        sales.push(formatSale(element))
    })
}

function formatSale(info){
    let sale = {
        saleId : ethers.BigNumber.from(info[0]).toNumber(),
        userId : ethers.BigNumber.from(info[1]).toNumber()
    }
    let items = []
    info[2].forEach((element,index) => {
        let item = {name:element,price: ethers.BigNumber.from(info[3][index]).toNumber()}
        items.push(item)
    })
    sale.item = items
    return sale
}

module.exports = {
    getSale: getSale,
    getSales:getSales,
    createSale:createSale,
    getSalesByUserId:getSalesByUserId
}