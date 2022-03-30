const express = require('express');
const router = express.Router();
const path = require('path');
const { createPost, editPost } = require(path.join(
  __dirname,
  '../controllers/postController'
));

router.post('/create', createPost);
router.put('/edit', editPost);

module.exports = router;
