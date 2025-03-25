const express = require("express");
const userController = require("../api/user/userController");
const postController = require("../api/post/postController")

module.exports = function (server) {
  const router = express.Router();
  server.use("/api", router);

  router.use(userController);
  router.use(postController)
};