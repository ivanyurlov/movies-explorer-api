const usersRoutes = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCurrentUser, editProfileUserInfo,
} = require('../controllers/users');

usersRoutes.get('/users/me', getCurrentUser);

usersRoutes.patch('/users/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), editProfileUserInfo);

module.exports = {
  usersRoutes,
};
