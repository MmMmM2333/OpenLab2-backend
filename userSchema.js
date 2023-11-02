const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    id: Number,
    username: String,
    studentID: String,
    password: String,
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