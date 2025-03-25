const bcrypt = require('bcrypt');
const restful = require("node-restful");
const mongoose = restful.mongoose;

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const UserSchema = new mongoose.Schema({
  avatar: { type: String },
  nickname: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  posts: [PostSchema],
  banner: { type: String },
  biography: { type: String }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = restful.model("User", UserSchema);
