const mongoose = require('mongoose')


const answerSchema = new mongoose.Schema({
    answers:[],
    test_id: {
        type: mongoose.ObjectId,
        ref: 'Test'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'USER'
    },
    correct_answers:Number,
    incorrect_answers:Number,
    status:{
        type: String,
        enum:['submitted','continue','expired']
    },
    s_time:{
        type: Date,
    }

})


const Answer = mongoose.model('Answer', answerSchema)


module.exports = Answer