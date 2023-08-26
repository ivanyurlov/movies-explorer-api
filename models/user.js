const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AuthorizationError = require('../utils/handleErrors/authorization-err');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Введенный email адрес - некорректный, повторите попытку ввода еще раз',
    },
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: '',
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUser(email, name, password) {
  return this.findOne({ email, name }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthorizationError('Неправильные почта, имя или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthorizationError('Неправильные почта, имя или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
