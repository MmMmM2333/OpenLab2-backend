const connection = require('./connection');
const userSchema = require('./userSchema');

let userModel = connection.model('users', userSchema, 'users');

module.exports = userModel;