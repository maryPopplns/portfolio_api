const express = require('express');
const router = express.Router();
const path = require('path');
const {
  getPosts,
  createPost,
  editPost,
  deletePost,
  likePost,
  unlikePost,
  // commentPost,
} = require(path.join(__dirname, '../controllers/postController'));

router.get('/', getPosts);
router.post('/', createPost);
router.put('/:postID', editPost);
router.delete('/:postID', deletePost);
router.put('/like/:postID', likePost);
router.put('/unlike/:postID', unlikePost);
// router.post('/unlike/:id', commentPost);

module.exports = router;
