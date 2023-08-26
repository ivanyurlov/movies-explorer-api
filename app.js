require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');

const { INTERNAL_SERVER_ERROR_STATUS_CODE } = require('./utils/errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes');

const { PORT } = process.env;
const { DB_URL } = process.env;
const app = express();

app.use(cors({
  origin: [
    'https://ivanyurlov.nomoredomainsicu.ru',
    'http://ivanyurlov.nomoredomainsicu.ru',
    'http://localhost:3000'],
}));

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(requestLogger);

app.use(routes);

app.use(errorLogger);
app.use(errors());

app.use((err, _req, res, next) => {
  const { statusCode = INTERNAL_SERVER_ERROR_STATUS_CODE, message } = err;
  res.status(statusCode).send({
    message: statusCode === INTERNAL_SERVER_ERROR_STATUS_CODE
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`Слушаем порт ${PORT}`);
});
