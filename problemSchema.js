const mongoose = require('mongoose');

let counterSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    miniTitle: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    score: {
        type: Number,
        required: true
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    totalCompleted: {
        type: Number,
        default: 0
    },
})

module.exports = counterSchema;