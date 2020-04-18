const { Router } = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const sendgrid = require('nodemailer-sendgrid-transport');
const router = Router();
const User = require('../models/user');
const keys = require('../keys');

/* email */
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const transporter = nodemailer.createTransport(
  sendgrid({
    auth: { api_key: keys.SENDGRID_API_KEY },
  })
);

/* validators */
const { registerValidators, loginValidators } = require('../utils/validators');

/* routes */
router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Auth',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  });
});

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

router.post('/login', loginValidators, async (req, res) => {
  try {
    /* valid errors */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('loginError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#login');
    }

    const { email, password } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      const matchPasswords = await bcrypt.compare(password, candidate.password);

      if (matchPasswords) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save(err => {
          if (err) {
            throw err;
          }
          /* successful login */
          res.redirect('/');
        });
      } else {
        req.flash('loginError', 'Wrong password');
        res.redirect('/auth/login#login');
      }
    } else {
      const date = {
        email: req.body.email,
        password: req.body.password,
      };
      req.flash('loginError', 'User with this email not founded');
      res.redirect('/auth/login#login');
    }
  } catch (err) {
    console.log(err);
  }
});

router.post('/register', registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPassword,
      cart: { items: [] },
    });
    await user.save();
    await transporter.sendMail(regEmail(email, name));
    res.redirect('/auth/login#login');
  } catch (err) {
    console.log(err);
  }
});

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Reset password',
    error: req.flash('error'),
  });
});

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.redirect('/auth/login');
    } else {
      res.render('auth/password', {
        title: 'Recovery password',
        error: req.flash('error'),
        userID: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something went wrong. Try again later.');
        return res.redirect('/auth/reset');
      }
      const token = buffer.toString('hex');

      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect('/auth/login');
      } else {
        req.flash('error', 'User with this email not founded.');
        res.redirect('/auth/reset');
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userID,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect('/auth/login');
    } else {
      req.flash('loginError', 'Your spend a lot of time.');
      return res.redirect('/auth/login');
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
