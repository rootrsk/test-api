const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const {} = require('../middleware/error')
const Test = require('../models/test')

// Get All user 
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.json({
            message: 'success',
            data: users
        })
    } catch (e) {
        res.json({
            message: 'error',
            error: 'Something went wrong.'
        })
    }
})

router.get('/admin/tests/:id',async(req,res)=>{
    try {
        console.log(req.params.id)
        const test = await Test.findOne({_id: req.params.id})
        res.json({
            status: 'success',
            message:'Fetched Successfully',
            test
        })
    } catch (e) {
        res.json({
            status:'failed',
            error:e,
            message: 'Something went wrong'
        })
    }
})
router.get('/tests',async(req,res)=>{
    try {
        const tests = await Test.find({})
        res.json({
            status: 'sucess',
            message: 'fetched successfully.',
            tests
        })
    } catch (e) {
        res.json({
            error:e,
            status:'failed',
            message: 'Something went Wrong'
        })
    }
})

// Get All Tests
router.post('/tests',async(req,res)=>{
    try {
        const tests = await Test.find({})
        res.json({
            success:true,
            status: 200,
            message: 'fetched successfully.',
            tests
        })
    } catch (e) {
        res.json({
            error: e,
            status: 'failed',
            message: 'Something went Wrong'
        })
    }
})
router.post('/test',async(req,res)=>{
    try {
        console.log(req.params.id)
        const test = await Test.findOne({_id: req.body.test_id})
        res.json({
            success:true,
            status: 'success',
            message:'Fetched Successfully',
            test
        })
    } catch (e) {
        res.json({
            status:'failed',
            error:e,
            message: 'Something went wrong'
        })
    }
})
router.post('/test-create',async(req,res)=>{
    try {
        const test = await new Test(req.body)
        await test.save()
        res.json({
            success:true,
            status: 200,
            message: 'fetched successfully.',
            test
        })
    } catch (e) {
        console.log(e.message)
        res.json({
            error: e,
            status: 'failed',
            message: 'Something went Wrong'
        })
    }
})


router.post('/admin/test',async(req,res)=>{
    try {
        const test = new Test(req.body)
        await test.save()
        res.json({
            status:'sucess',
            message:'Test File Created Successfully',
            test
        })
    } catch (e) {
        res.json({
            status:'falied',
            error:e,
            message: 'Something went wrong'
        })
    }
})

router.patch('/test',async(req,res)=>{
    console.log(req.bo)
    try {
        const test = await Test.findByIdAndUpdate(req.body._id,req.body)
        res.json({
            status:'success',
            message:'fetched successfully',
            test
        })
    } catch (e) {
        res.json({
            status:'falied',
            error: e,
            message:'Something went wrong.',
            
        })
    }
})
module.exports = router