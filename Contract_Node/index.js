const express = require('express');
const multer = require('multer')
const app = express();
const path = require('path')
const fs = require('fs')
const nfts = require('./scripts/nfts');

const salesRoutes = require('./routes/sales.js')
const userRoutes = require('./routes/user.js')
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(bodyParser.json())
app.use('/api',userRoutes)
app.use('/api',salesRoutes)

app.use(express.static(path.join(__dirname,'public')))
const upload = multer({dest:'uploads/'})
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'page/from.html'))
})

app.post('/uploadNFT',upload.single('image'),(req,res)=>{
    const image = req.file
    const {name,description} = req.body;
    const destinationPath = `uploads/${image.originalname}`
    fs.rename(image.path,destinationPath,async(err)=>{
        if(err){
            console.log(err)
            res.status(500).send('Error saving image')
        }
        else{
            var result = await nfts.createNFT({
                imageRoute:destinationPath,
                name:name,
                description:description
            })
            console.log(result)
            res.redirect(`https://sepolia.etherscan.io/tx/${result}`)
        }
    })
})
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`server running ${PORT}`))