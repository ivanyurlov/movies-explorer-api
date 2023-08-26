const jwt = require('jsonwebtoken');
const AuthorizationError = require('../utils/handleErrors/authorization-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, _res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthorizationError('Неправильные почта, имя или пароль');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    next(new AuthorizationError('Неправильные почта, имя или пароль'));
  }
  req.user = payload;
  next();
};
