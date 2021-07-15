const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const userAuth = require('../middleware/userAuth')
const {userErrorHandler} = require('../middleware/error')
const Test = require('../models/test')
const Answer = require('../models/answer')
const Chart = require('../models/chart')
const differenceInSeconds = require('date-fns/differenceInSeconds')

router.post('/',async(req,res)=>{
    try {
        const test = await Test.find({})
        // .select('id title type category langauge cat_value standard timelimit s_time e_time price questions._id')
        const tests = await test.map((item)=>({
            _id: item._id,
            logo: item.logo,
            title: item.title,
            type: item.type,
            category: item.category,
            cat_value: item.cat_value,
            time_limit: item.time_limit,
            price: item.price,
            language: item.langauge,
            questions : item.questions.length

        }))
        await Promise.all(tests)
        res.json({
            success:true,
            message:'fetched successfully',
            status:200,
            tests
        })
    } catch (e) {
        res.json({
            success:false,
            message: 'failed',
            error:e.message,
            status: 500
        })
    }
})

router.post('/questions',userAuth, async (req, res) => {
    try {
        const test = await Test.findOne({_id :req.body.test_id})
            .select('id title price type category langauge cat_value standard timelimit s_time e_time questions._id questions.qn_h questions.e questions.qn_type questions.statement_1 questions.statement_2 questions.subject questions.option_1 questions.option_2 questions.option_3 questions.option_4')
        res.json({
            success: true,
            message: 'fetched successfully',
            status: 200,
            tests: test
        })
    } catch (e) {
        res.json({
            success: false,
            message: 'failed',
            error: e.message,
            status: 500
        })
    }
})
router.post('/verify',userAuth, async (req, res) => {
    console.log(req.body)
    try {
        const test = await Test.findById(req.body.test_id).select('_id title price type category cat_value standard s_time e_time')
        if(!test) throw new Error('test is not available')
        console.log(test.price)
        if(test.price===0){
            if(test.type==='live'){
                // if(test.s_time)
                return res.json({
                    status: 200,
                    message: 'verified successfully',
                    success: true,
                    test,
                    test_status:{
                        is_ready:true,

                    }
                })
            }

            if(test.type === 'test') {
                return res.json({
                    status: 200,
                    message: 'verified successfully',
                    success: true,
                    test
                })
            }
            return res.json({
                status: 200,
                message: 'verified successfully',
                success: true,
                test
            })

        } else {
            throw new Error ('this test is not available for you')
        }
        
    } catch (e) {
        res.json({
            success: false,
            message: 'failed',
            error: e.message,
            status: 403
        })
    }
})
router.post('/start', userAuth, async (req, res) => {
    console.log(req.body)
    try {
        const test = await Test.findById(req.body.test_id)
        const questions= test.questions.map((qn,index)=>{
            const question = qn.toObject()
            delete question.correct_answer
            delete question.correct_option
            delete question.explanation
            return question
        })
        if (req.user.continued_tests.includes(test._id)) {
            const continued_test = await Answer.findOne({test_id:test._id,status:'continue'})
            if(!continued_test){
                return res.json({
                    status: 200,
                    message: 'Something went wrong',
                    success: true,
                    test,
                    answer: continued_test.answers
                })
            }
            return res.json({
                status: 200,
                message: 'Test has been started',
                success: true,
                test,
                answer:continued_test.answers
            })
        }
        req.user.continued_tests.concat(test._id);
        await Promise.all(questions)
        const answers = new Array(questions.length).fill({
            is_visited: false,
            user_answer: null,
            is_marked: false,
            time_spend: 0,
        })
        await Promise.all(answers)
        const answer = new Answer({
            test_id: test._id,
            user_id: req.user._id,
            answers,
            status: 'continue',
            s_time: new Date()
        })
        test.questions=questions
        
        if (!test) throw new Error('Test is not available')
        return res.json({
            status: 200,
            message: 'Test has been started',
            success: true,
            test,
            answer
        })
    } catch (e) {
        res.json({
            success: false,
            message: 'failed',
            error: e.message,
            status: 403
        })
    }
})
router.post('/submission', userAuth, async (req, res) => {
    try {
        const test = await Test.findById(req.body.test_id)
        var correct_answers = 0
        var incorrect_answers = 0

        if (!test) throw ('test is not available')
        test.questions.map((question,index)=>{
            if(req.body.answers.length>index){
                if(req.body.answers[index].user_answer === question.correct_option){
                    correct_answers++
                }else{
                    incorrect_answers++
                }
            }
        })
        res.json({
            status: 200,
            message: 'submitted successfully',
            success: true,
            correct_answers,
            incorrect_answers
        })

    } catch (e) {
        res.json({
            success: false,
            message: 'failed',
            error: e.message,
            status: 403
        })
    }
})


router.post('/',async(req,res)=>{
    try {
        const test = await Test.find({})
        res.json({
            success:true,
            message:'fetched successfully',
            tests:test
        })
    } catch (e) {
        res.json({
            success:false,
            message: 'failed',
            error:e.message    
        })
    }
})

module.exports = router