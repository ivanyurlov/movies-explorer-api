const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { usersRoutes } = require('./users');
const { moviesRoutes } = require('./movies');
const NotFoundError = require('../utils/handleErrors/not-found-err');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(4),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(30),
    password: Joi.string().required().min(4),
  }),
}), createUser);
router.use(auth);
router.use(usersRoutes);
router.use(moviesRoutes);
router.use('*', (_req, _res, next) => next(new NotFoundError('Страница не найдена')));

module.exports = router;
