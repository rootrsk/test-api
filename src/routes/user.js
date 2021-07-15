const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const userAuth = require('../middleware/userAuth')
const {userErrorHandler} = require('../middleware/error')
const Test = require('../models/test')
const Answer = require('../models/answer')
const Chart = require('../models/chart')

router.get('/',(req,res)=>{
    res.send({
        message: 'success',
        data: {
            welcome: 'Welcome to Test Api',
            // headers :req.useragent,
            device:{
                browser: req.useragent.browser,
                os: req.useragent.os,
                source: req.useragent.source
            }
        }
    })
})

router.post('/signup',async(req,res)=>{    
    try {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            contact_no: req.body.contact,
            password: req.body.password,
            full_name:req.body.full_name
        })
        await user.save()
        const token = user.genAuthToken()
        
        user.tokens = user.tokens.concat({
            token: token,
            browser: req.useragent.browser,
            device: req.useragent.os
        })
        let options = {
            // maxAge: 1000*60*60, // would expire after 30 seconds
            httpOnly: false, // The cookie only accessible by the web server
            signed: false // Indicates if the cookie should be signed
        }
        res.cookie('auth_token', token, options)
        const chart = new Chart({ user_id:user._id})
        await chart.save()   
        res.send({
            message: 'success',
            user: user,
            token,
            cookies: req.cookies
        })
    } catch (e) {
        console.log(e)
        const {error,status} = userErrorHandler(e.message)
        res.send({
            message: 'failed',
            error,
            status,
            success:false
        })
    }
})


router.post('/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = user.genAuthToken()
        user.tokens = user.tokens.concat({
            token: token,
            browser: req.useragent.browser,
            device: req.useragent.os
        })
        user.save()

        let options = {
            // maxAge: 1000*60*60, // would expire after 30 seconds
            httpOnly: false, // The cookie only accessible by the web server
            signed: false // Indicates if the cookie should be signed
        }
        res.cookie('auth_token', token, options)
        res.send({
            status: 200,
            success: true,
            message: 'fetched successfully',
            user: user,
            token,
        })
    } catch (e) {
        const {error,status} = userErrorHandler(e.message)
        res.send({
            message: 'failed',
            error,
            status,
            success: false
        })
    }
})

router.post('/update',userAuth, async (req, res) => {
    try {
        const allowedUpdates = ['password','contact','city','profile_pic','full_name']
        const userUpdates = Object.keys(req.body)
        const isValidUpdate = userUpdates.every((update)=>allowedUpdates.includes(update))
        if(!isValidUpdate) throw 'you are trying to update restricted data'
        const user = req.user
        userUpdates.forEach((update)=> user[update] = req.body[update])
        user.save()
        
        res.json({
            status:200,
            success:true,
            message:'updated successfully',
            user
        })
    } catch (e) {
        res.send({
            message: 'failed',
            error:e.message
        })
    }
})

router.post('/v2/create-test',async(req,res)=>{
    try {
        const test = await new Test(req.body)
        await test.save()
        res.send(test)
    } catch (e) {
        res.send({
            message: 'failed',
            e
        })
    }
})

router.post('/v2/test',async(req,res)=>{
    try {
        const test = await Test.findById(req.body.test_id)
        res.send(test)
    } catch (e) {
        res.send({
            message: 'failed',
            e
        })
    }
})
router.get('/v2/tests',async(req,res)=>{
    try {
        const test = await Test.find({})
        res.send(test)
    } catch (e) {
        res.send({
            message: 'failed',
            e
        })
    }
})



router.post('/logout',userAuth,async(req,res)=>{
    try {
        const user = req.user
        console.log(user)
        res.send({
            message: 'success',
            user: user,
        })
    } catch (e) {
        res.send({
            message: 'failed',
            error: e.message
        })
    }
})

router.get('/me',userAuth,async(req,res)=>{
    try {
        const charts = await Chart.findOne({user_id: req.user._id})
        const testsCount = await Test.countDocuments()
        const completed_tests = await Answer.find({}).countDocuments()
        res.json({
            status: 'success',
            isAutheticated: true,
            user:req.user,
            charts,
            testsCount,
            completed_tests
        })
    } catch (error) {
        
    }
    
})
router.post('/test-verification',async(req,res)=>{
    try {
        const test = await Test.findById(req.body._id)
        res.json({
            status: 'success',
            isAutheticated: true,
            test
        })
    } catch (error) {
        res.json({
            status: 'failed',
        })    
    }
})
router.post('/test/submit',userAuth, async (req, res) => {
    try {
        const test = await Test.findById(req.body._id)
        if(!test) throw new Error('Test not found')
        if(!req.body.answers) throw new Error('No answer Sheet found.')
        if(!req.user) throw new Error('No user found')
        let correct_answers = 0
        let incorrect_answers = 0
        test.questions.map((question,index)=>{
            req.body.answers[index].user_answer ?
                question.correct_option === req.body.answers[index].user_answer ? correct_answers++ : incorrect_answers++: null
        })
        const  answer  = new Answer({
            correct_answers,
            incorrect_answers,
            answers:req.body.answers,
            test_id: test._id,
            user_id: req.user._id
        })
        
        const questions = test.questions.length
        const attempts = correct_answers+incorrect_answers
        await answer.save()
        let charts = await Chart.findOne({user_id: req.user._id})
        console.log(charts)
        if(!charts){
            const chart = new Chart({user_id:req.user._id,accuracy:[],marks:[]})
            await chart.save()
            charts = await Chart.findById(chart._id)
        }
        charts.accuracy = [...charts.accuracy, (correct_answers / attempts) * 100]
        charts.marks = [...charts.marks,Math.round((correct_answers/questions)*100)]
        charts.activity = [...charts.activity,Date.now()]
        await charts.save()
        res.json({
            status: 'success',
            message: 'Submited Successfully',
            answer,
            questions,
            attempts,
            charts
        })
    } catch (e) {
        res.json({
            status: 'failed',
            error: e.message,
            message: 'Something went Wrong.'
        })
    }
})
router.get('/test/:id',async(req,res)=>{
    try {
        const test = await Test.findById(req.params.id)
        const questions = await test.questions.map(question=>{
            // console.log(question.correct_option)
            const qn = question.toObject()
            delete qn.correct_option
            // console.log(question.correct_option)
            return qn
        })
        test.questions = questions
        console.log(questions)
        res.json({
            status: 'success',
            message: 'Fetched Successfully',
            test
        })
        
    } catch (e) {
        res.json({
            status:'failed',
            error: e,
            message: 'Something went Wrong.'
        })
    }
})
router.get('/completed-test/:id',async(req,res)=>{
    try {
        console.log(req.params.id)
        const test = await Answer.findById(req.params.id).populate('test_id')
        res.json({
            status: 'success',
            message: 'Fetched Successfully',
            test
        })
    } catch (e) {
        console.log(e)
        res.json({
            status: 'failed',
            error: e,
            message: 'Something went Wrong.'
        })
    }
})
router.post('/dashboard',userAuth,async(req,res)=>{
    try {
        const charts = await Chart.findOne({user_id: req.user._id})
        const testsCount = await Test.countDocuments()
        const completed_tests = await Answer.find({}).countDocuments()
        res.json({
            status: 'success',
            message: 'Fetched Successfully',
            charts,
            user: req.user,
            total_attemps: charts.accuracy.length,
            total_tests: testsCount,
            completed_tests
        })
    } catch (e) {
        res.json({
            status: 'failed',
            error: e.message,
            message: 'Something went Wrong.'
        })
    }
})

router.post('/tests',async(req,res)=>{
    try {
        const tests =await Test.find({})
        res.json({
            status: 'success',
            message: 'Fetched Successfully',
            tests
        })
    } catch (e) {
        res.json({
            status: 'failed',
            error: e,
            message: 'Something went Wrong.'
        })
    }
})
module.exports = router