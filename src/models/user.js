const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique:true,
        min:5,
        max:15
    },
    full_name:{
        type:String,
        required: true,
        trim:true,
        min:5,
        max:25
    },
    password: {
        type: String,
        required: true,
        min:6,
        max:25
    },
    contact_no: {
        type: String,
        trim: true,
        min:10,
        max:20
    },
    profile_pic:{
        type:String
    },
    city: {
        type: String,
        trim: true,
        min:3,
        max:15
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        min:5,
        max:30
    },
    tokens: [{
        token: {
            type: String
        },
        device: {
            type: String
        },
        browser: {
            type: String
        }
    }],
    verified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number,
        s_time:{
            type:Date,
            default: Date.now()
        }
    },
    v_token:{
        type:String
    },
    v_attempt:{
        type:Number,
        default:0
    },
    blocked:{
        type:Boolean,
        default:false
    },
    continued_tests:{
        type:Array,
        default:[]
    },
}, {
    timestamps: true
})


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if (!user) throw new Error('Email or  password is incorrect')
    const isMatch = await bcrypt.compare(password, user.password)
    console.log(isMatch)
    if (!isMatch) throw new Error('Email or password is incorrect')
    return user
}
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    // delete userObject.tokens
    return userObject
}
userSchema.methods.genAuthToken = function () {
    const user = this
    const token = jwt.sign({
        _id: user._id.toString()
    }, process.env.JWT_SECRET)
    return token
}
userSchema.methods.emailVerificationToken = async function () {
    const user = this
    const token = jwt.sign({
        _id: user._id.toString()
    }, process.env.JWT_SECRET)
    return token
}
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User