const mongoose = require('mongoose')


const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    link:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    full_description:{
        type: String,
    }
})


const Notification = mongoose.model('Notification', notificationSchema)


module.exports = Notification