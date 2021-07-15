const mongoose = require('mongoose')


const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    logo:{
        type:String,
        default: 'https://banner2.cleanpng.com/20180930/keh/kisspng-central-board-of-secondary-education-national-coun-ncert-books-for-pc-download-windows-7-8-1-xp-5bb151c994df61.4908072315383474656098.jpg'
    },
    price:{
        type:Number,
        default:0
    },
    type: {
        type: String,
        required: true,
        enum:['live','quiz','nor','prs','test']
    },
    category: {
        type: String,
        required: true,
        enum:['yr','cw','sw','rm','prs']
    },
    language: {
        type: String,
        required: true,
        default: 'he',
        enum:['h','e','he']
    },
    cat_value: {
        type: String,
        required: true,
    },
    board:{
        type: String,
    },
    stream:{
        type: String,
        lowercase: true,
        enum:['pm','sci','arts','gc','otr']
    },
    published:{
        type: Boolean,
        default: false
    },
    standard: {
        type: String,
        required: true,
        enum:['1','2','3','4','5','6','7','8','9','10','11','12','rw','ssc','cgl','gn','mn','all']
    },
    time_limit: {
        type: Number,
    },
    s_time: {
        type: Date,
    },
    e_time: {
        type: Date,
    },
    correct_marking: {
        type: Number,
        default: 1
    },
    incorrect_marking: {
        type: Number,
        default: 0
    },
    questions: [{
        heading:{
            type:String
        },
        qn_h: {
            type:String
        },
        qn_e: {
            type:String
        },
        qn_type:{
            type: String,
            enum:['mcq','fib','sb','tf']
        },
        statement_1: {
            type:String
        },
        statement_2: {
            type:String
        },
        subject: {
            type:String
        },
        option_1: {
            type:String
        },
        option_2: {
            type:String
        },
        option_3: {
            type:String
        },
        option_4: {
            type:String
        },
        correct_option: {
            type: Number
        },
        correct_answer: {
            type:String
        },
        explanation: {
            type:String
        },
    }]              

})


const Test = mongoose.model('Test', testSchema)


module.exports = Test