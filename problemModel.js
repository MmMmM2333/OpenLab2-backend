const connection = require('./connection');
const problemSchema = require('./problemSchema');

let problemModel = connection.model('problems', problemSchema, 'problems');

module.exports = problemModel;