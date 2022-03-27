require('dotenv').config();

exports.createPost = [
  function isLoggedIn(req, res, next) {
    req.user && next();
    !req.user && res.status(401).json({ messsage: 'unauthorized' });
  },
  function isSuperUser(req, res, next) {
    const isSuper = req.user.id === process.env.SUPER_USER_ID;
    isSuper && next();
    !isSuper && res.status(403).json({ message: 'forbidden' });
  },
  function createPost(req, res, next) {
    res.end('this is the end');
  },
];
