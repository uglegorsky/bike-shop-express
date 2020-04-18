const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { bikeValidators } = require('../utils/validators');
const { validationResult } = require('express-validator');
const Bike = require('../models/bike');

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Add new bike',
    isAdd: true,
  });
});

router.post('/', auth, bikeValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('add', {
      title: 'Add new bike',
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        name: req.body.name,
        price: req.body.price,
        img: req.body.img,
      },
    });
  }

  const bike = new Bike({
    name: req.body.name,
    price: req.body.price,
    img: req.body.img,
    userID: req.user,
  });

  try {
    await bike.save();
    res.redirect('/bikes');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
