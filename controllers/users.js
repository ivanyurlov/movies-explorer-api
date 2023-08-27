const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');
const {
  OK_STATUS_CODE,
  CREATED_STATUS_CODE,
} = require('../utils/errors');
const NotFoundError = require('../utils/handleErrors/not-found-err');
const BadRequestError = require('../utils/handleErrors/bad-request-err');
const DublicationError = require('../utils/handleErrors/dublication-err');

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      return res.status(OK_STATUS_CODE).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при запросе пользователя'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email, name,
  } = req.body;
  bcrypt.hash(req.body.password, 10).then((hash) => User.create({
    email,
    name,
    password: hash,
  }))
    .then((user) => res.status(CREATED_STATUS_CODE).send({
      email: user.email,
      name: user.name,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(
          'Переданы некорректные данные при создании пользователя',
        ));
      }
      if (err.code === 11000) {
        return next(new DublicationError('Пользователь с такой почтой уже зарегистрирован'));
      }
      return next(err);
    });
};

module.exports.editProfileUserInfo = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      return res.status(OK_STATUS_CODE).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при редактировании пользователя'));
      }
      if (err.code === 11000) {
        return next(new DublicationError('Пользователь с такой почтой уже зарегистрирован'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });

      return res.status(OK_STATUS_CODE).send({ token });
    })
    .catch((err) => next(err));
};
