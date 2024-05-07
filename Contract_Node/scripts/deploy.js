async function main(){
    const Sales = await ethers.getContractFactory('Sales') //NFT2024
    const sales = await Sales.deploy()
    const txHash = sales.deployTransaction.hash;
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract deployed to Address",txReceipt.contractAddress);
}

main().then(()=>{process.exit(0)}).catch((error)=>{
    console.log(error),process.exit(1)
})