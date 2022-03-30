const express = require('express');
const router = express.Router();
const path = require('path');
const { createPost, editPost, deletePost } = require(path.join(
  __dirname,
  '../controllers/postController'
));

router.post('/create', createPost);
router.put('/edit/:id', editPost);
router.delete('/delete/:id', deletePost);

module.exports = router;
