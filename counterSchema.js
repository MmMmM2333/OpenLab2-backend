const mongoose = require('mongoose');

let counterSchema = mongoose.Schema({
    name: String,
    id: Number
})

module.exports = counterSchema;