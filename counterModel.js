const connection = require('./connection');
const counterSchema = require('./counterSchema');

let counterModel = connection.model('counter', counterSchema, 'counter');

module.exports = counterModel;