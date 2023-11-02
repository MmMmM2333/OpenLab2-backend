const mongoose = require('mongoose');

let roleSchema = mongoose.Schema({
    roleID: Number,
    name: String,
})

module.exports = roleSchema;