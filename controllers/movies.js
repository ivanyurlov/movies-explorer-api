const Movie = require('../models/movie');
const {
  OK_STATUS_CODE,
  CREATED_STATUS_CODE,
} = require('../utils/errors');
const NotFoundError = require('../utils/handleErrors/not-found-err');
const BadRequestError = require('../utils/handleErrors/bad-request-err');
const ForbiddenError = require('../utils/handleErrors/forbidden-err');

module.exports.getMovies = (_req, res, next) => {
  Movie.find({})
    .then((movie) => res.status(OK_STATUS_CODE).send(movie))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.status(CREATED_STATUS_CODE).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(BadRequestError('Переданы некорректные данные при создании фильма'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    // eslint-disable-next-line consistent-return
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Запрашиваемый фильм не найден');
      }
      if (String(movie.owner) === String(req.user._id)) {
        Movie.deleteOne(movie)
          .then((cardDelete) => res.status(OK_STATUS_CODE).send(cardDelete))
          .catch(next);
      } else {
        return next(new ForbiddenError('Недостаточно прав для удаления фильма'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные при удалении фильма'));
      }
      return next(err);
    });
};
