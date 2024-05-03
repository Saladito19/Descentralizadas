//require('dotenv').config()
require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const {ethers} = require('ethers')
const contract = require('../artifacts/contracts/User.sol/Users.json')
const { format } = require('path')
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    USER_CONTRACT
} = process.env

async function createTransaction(provider,method,params) {
    const etherInterface = new ethers.utils.Interface(contract.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY,'latest')
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId} = network;
    const transaction = {
        from : PUBLIC_KEY,
        to : USER_CONTRACT,
        nonce,
        chainId,
        gasPrice,
        data: etherInterface.encodeFunctionData(method,params)
    }
    return transaction
}

async function createUser(firstname, lastname) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    const transaction = await createTransaction(provider,"insertUser",[firstname,lastname]);
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

async function getUsers() {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const userContract = new ethers.Contract(USER_CONTRACT,contract.abi,provider)
    const result = await userContract.getUsers()
    var users = []
    result.forEach(element => {
        users.push(formatUser(element))
    })
    return users;
}

async function getUser(userId) {
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const userContract = new ethers.Contract(USER_CONTRACT,contract.abi,provider)
    const result = await userContract.getUsersById(userId)
    return formatUser(result);
}

async function updateAmount(userId,amount){
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    const transaction = await createTransaction(provider,"registerSale",[userId,amount]);
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

function formatUser(info) {
    return {
        firstname:info[0],
        lastname:info[1],
        amount:ethers.BigNumber.from(info[2]).toNumber(),
        id:ethers.BigNumber.from(info[3]).toNumber()
    }
}

module.exports = {
    getUser:getUser,
    getUsers:getUsers,
    createUser:createUser,
    updateAmount:updateAmount
}