async function main(){
    const NFT2024 = await ethers.getContractFactory('NFT2024')
    const nft2024 = await NFT2024.deploy()
    const txHash = nft2024.deployTransaction.hash;
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.lof("Contract deployed to Address",txReceipt.contractAddress);
}

main().then(()=>{process.exit(0)}).catch((error)=>{
    console.log(error),process.exit(1)
})