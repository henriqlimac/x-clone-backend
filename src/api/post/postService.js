const Post = require('./postModel');

Post.methods(['get', 'post', 'put', 'delete']);
Post.updateOptions({ new: true, runValidators: true });

module.exports = Post;