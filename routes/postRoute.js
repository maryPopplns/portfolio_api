const express = require('express');
const router = express.Router();
const path = require('path');
const {
  getPosts,
  createPost,
  editPost,
  deletePost,
  likePost,
} = require(path.join(__dirname, '../controllers/postController'));

router.get('/', getPosts);
router.post('/', createPost);
router.put('/:id', editPost);
router.delete('/:id', deletePost);
router.put('/like/:id', likePost);

module.exports = router;
