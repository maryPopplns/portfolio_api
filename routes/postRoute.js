const express = require('express');
const router = express.Router();
const path = require('path');
const { createPost } = require(path.join(
  __dirname,
  '../controllers/postController'
));

router.post('/create', createPost);

module.exports = router;
