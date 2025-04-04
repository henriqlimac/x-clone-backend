const User = require('./userModel');

User.methods(['get', 'post', 'put', 'delete']);
User.updateOptions({ new: true, runValidators: true });

module.exports = User;