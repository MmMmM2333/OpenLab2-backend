const mongoose = require('mongoose');

let problemSchema = mongoose.Schema({
    name: String,
    id: Number
})

module.exports = problemSchema;