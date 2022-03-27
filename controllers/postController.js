require('dotenv').config();

exports.createPost = [
  function authentication(req, res, next) {
    const isSuper = req.user.id === process.env.SUPER_USER_ID;
    isSuper && next();
    !isSuper && next({ status: 403, message: 'not super user' });
  },
];
