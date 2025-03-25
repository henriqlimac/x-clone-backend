const restful = require("node-restful");
const mongoose = restful.mongoose;

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

module.exports = restful.model("Post", PostSchema);
