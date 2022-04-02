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
  commentPost,
  deletePostComment,
  likePostComment,
} = require(path.join(__dirname, '../controllers/postController'));

router.get('/', getPosts);
router.post('/', createPost);
router.put('/:postID', editPost);
router.delete('/:postID', deletePost);

router.put('/like/:postID', likePost);
router.put('/unlike/:postID', unlikePost);
router.put('/like/:postID/:commentID', likePostComment);

router.post('/comment/:postID', commentPost);
router.delete('/comment/:postID/:commentID', deletePostComment);

module.exports = router;
