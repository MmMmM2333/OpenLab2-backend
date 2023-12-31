const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    studentID: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    hasJoin: { type: Boolean, default: false },
    score: [],
    roleID: {
        type: Number,
        default: 0
    },
    createTime: {
        type: Date,
        default: Date.now
    }
})

module.exports = userSchema;