const connection = require('./connection');
const roleSchema = require('./roleSchema');

let roleModel = connection.model('role', roleSchema, 'role');

module.exports = roleModel;