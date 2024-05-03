async function main(){
    const Users = await ethers.getContractFactory('Users') //NFT2024
    const users = await Users.deploy()
    const txHash = users.deployTransaction.hash;
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract deployed to Address",txReceipt.contractAddress);
}

main().then(()=>{process.exit(0)}).catch((error)=>{
    console.log(error),process.exit(1)
})