const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales');
const userController = require('../controllers/users')
router.get('/sales',async (req,res)=>{
    try{
        let sales = await salesController.getSales()
        res.json(sales);
    }catch(ex){
        res.status(500).json({ message: ex.message });
    }
});
router.get('/sale/:id',async (req,res)=>{
    try{
        console.log(req.params)
        let sale = await salesController.getSale(req.params.id)
        res.json(sale);
    }catch(ex){
        res.status(500).json({ message: ex.message });
    }
});
router.get('/usersales/:id',async (req,res)=>{
    try{
        let sales = await salesController.getSalesByUserId(req.params.id)
        res.json(sales);
    }catch(ex){
        res.status(500).json({ message: ex.message });
    }
});
router.post('/sale',async (req,res)=>{
    try{
        let sale = await salesController.createSale(req.body.userId,req.body.items,req.body.prices)
        let userSale = await userController.updateUser(req.body.userId,req.body.prices.reduce((a, b) => a + b, 0))
        res.json(sale);
    }catch(ex){
        res.status(500).json({ message: ex.message });
    }
});


module.exports = router;