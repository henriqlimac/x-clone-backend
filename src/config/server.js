const express = require('express');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');

const allowCors = require('./cors');

const port = 3003;
const server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cookieParser());
server.use(allowCors);

server.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

module.exports = server;
