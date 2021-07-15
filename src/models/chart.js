const mongoose = require('mongoose')

const chartSchema = new mongoose.Schema({
    marks: [],
    accuracy:[],
    activity: [{
        type: Date,
        default: Date.now
    }],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})


const Chart = mongoose.model('Chart', chartSchema)


module.exports = Chart