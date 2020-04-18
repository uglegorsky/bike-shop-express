const { body } = require('express-validator');
const User = require('../models/user');

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Entry valid email')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('A user with this email already exists.');
        }
      } catch (err) {
        console.log(err);
      }
    })
    .normalizeEmail(),
  body('password', 'Password maybe from 6 to 56 symbols lenght')
    .isLength({ min: 6, nax: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match');
      }
      return true;
    })
    .trim(),
  body('name')
    .isLength({ min: 3 })
    .withMessage('Name maybe minimum length 3 symbols')
    .trim(),
];

exports.loginValidators = [
  body('email', 'Entry valid email').isEmail(),
  body('password', 'Password maybe from 6 to 56 symbols lenght')
    .isLength({ min: 6, nax: 56 })
    .isAlphanumeric()
    .trim(),
];

exports.bikeValidators = [
  body('name')
    .isLength({ min: 3 })
    .withMessage('Name maybe minimum length 3 symbols')
    .trim(),
  body('price').isNumeric().withMessage('Entry correct price'),
  body('img', 'Entry correct URL image').isURL(),
];
