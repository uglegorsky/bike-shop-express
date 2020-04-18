const { Router } = require('express');
const auth = require('../middleware/auth');
const router = Router();
const { bikeValidators } = require('../utils/validators');
const { validationResult } = require('express-validator');
const Bike = require('../models/bike');

function isOwner(bike, req) {
  return bike.userID.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
  try {
    const bikes = await Bike.find()
      .lean()
      .populate('userID', 'email name')
      .select('price name img');
    res.render('bikes', {
      title: 'Bikes',
      isBikes: true,
      userID: req.user ? req.user._id.toString() : null,
      bikes,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) return res.redirect('/');

  try {
    const bike = await Bike.findById(req.params.id).lean();

    if (!isOwner(bike, req)) {
      return res.redirect('/bikes');
    }
    res.render('bike-edit', {
      title: `Edit ${bike.name}`,
      bike,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/edit', auth, bikeValidators, async (req, res) => {
  const ID = req.body.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).res.redirect(`/bikes/${id}/edit?allow=true`);
  }

  try {
    delete req.body.id;
    const bike = await Bike.findById(ID);
    if (!isOwner(bike, req)) {
      return res.redirect('/bikes');
    }
    Object.assign(bike, req.body);
    await bike.save();
    res.redirect('/bikes');
  } catch (err) {
    console.log(err);
  }
});

router.post('/remove', auth, async (req, res) => {
  try {
    await Bike.deleteOne({
      _id: req.body.id,
      userID: req.userID,
    });
    res.redirect('/bikes');
  } catch (err) {
    console.log(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id).lean();
    res.render('bike', {
      layout: 'empty',
      title: `Bike ${bike.name}`,
      bike,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
